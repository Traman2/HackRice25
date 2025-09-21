import { TwelveLabs, TwelvelabsApi } from "twelvelabs-js";
import dotenv from 'dotenv';
import { StateGraph, Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import z from "zod";

dotenv.config();

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    temperature: 0
});
const client = new TwelveLabs({ apiKey: process.env.TWELVELABS_KEY });

const StateAnnotation = Annotation.Root({
    userQuery: Annotation<string>,
    twelveLabRouter: Annotation<string>,
    type: Annotation<string>,
    summaryOutput: Annotation<string>,
    chapterOutput: Annotation<z.infer<typeof chapterObjectSchema>[] | undefined>,
    highlightOutput: Annotation<z.infer<typeof highlightObjectSchema>[] | undefined>
});

const agentWorkflow = new StateGraph(StateAnnotation)
    .addNode("queryCallRouter", queryCallRouter)
    .addNode("createSummary", createSummary)
    .addNode("createChapter", createChapter)
    .addNode("createHighlight", createHighlight)
    .addEdge("__start__", "queryCallRouter")
    .addConditionalEdges(
        "queryCallRouter",
        queryRouteDecision,
        ["createSummary", "createChapter", "createHighlight"]
    )
    .addEdge("createSummary", "__end__")
    .addEdge("createChapter", "__end__")
    .addEdge("createHighlight", "__end__")
    .compile();

const twelveLabRouterSchema = z.object({
    step: z.enum(["createSummary", "createChapter", "createHighlight"]).describe(
        "The next step in the routing process"
    ),
});

const twelveLabQueryClassifyRouterAgent = llm.withStructuredOutput(twelveLabRouterSchema);

//Router LLM Code
async function queryCallRouter(state: typeof StateAnnotation.State) {
    // Route the input to the appropriate node
    const decision = await twelveLabQueryClassifyRouterAgent.invoke([
        {
            role: "system",
            content: `Analyze the user's request and route to the appropriate handler: 
                      'createSummary' if request wants summary,
                      'createChapter' for chapter related information or information on a certain section of a video
                      'createHighlight' for highlights of videos.`
        },
        {
            role: "user",
            content: state.userQuery
        },
    ]);

    return { twelveLabRouter: decision.step };
}

//Router Conditional
function queryRouteDecision(state: typeof StateAnnotation.State) {
    if (state.twelveLabRouter === "createSummary") {
        return "createSummary";
    } else if (state.twelveLabRouter === "createChapter") {
        return "createChapter";
    } else {
        return "createHighlight";
    }
}

const chapterObjectSchema = z.object({
    chapterNumber: z.number(),
    startSec: z.number(),
    endSec: z.number(),
    chapterTitle: z.string(),
    chapterSummary: z.string(),
});

const highlightObjectSchema = z.object({
    highlight: z.string(),
    startSec: z.number(),
    endSec: z.number(),
});

async function createSummary(state: typeof StateAnnotation.State) {
    if (!process.env.TL_VID_ID) {
        throw new Error("TL_VID_ID environment variable is not set");
    }

    const summary_res = await client.summarize({
        videoId: process.env.TL_VID_ID,
        type: "summary",
        prompt: state.userQuery,
    });

    if ("summary" in summary_res) {
        return { summaryOutput: summary_res.summary, type: "summary" }
    }
    return { summaryOutput: "", type: "summary" }; //failed
}

async function createChapter(state: typeof StateAnnotation.State) {
    if (!process.env.TL_VID_ID) {
        throw new Error("TL_VID_ID environment variable is not set");
    }

    const chapters_res = await client.summarize({
        videoId: process.env.TL_VID_ID,
        type: "chapter",
        prompt: state.userQuery,
    });

    if ("chapters" in chapters_res && Array.isArray(chapters_res.chapters)) {
        const chapters: z.infer<typeof chapterObjectSchema>[] = chapters_res.chapters.filter((chapter): chapter is z.infer<typeof chapterObjectSchema> => (
            typeof chapter.chapterNumber === 'number' &&
            typeof chapter.startSec === 'number' &&
            typeof chapter.endSec === 'number' &&
            typeof chapter.chapterTitle === 'string' &&
            typeof chapter.chapterSummary === 'string'
        ));

        for (const chapter of chapters) {
            console.log(
                `Chapter ${chapter.chapterNumber}\nstart=${chapter.startSec}\nend=${chapter.endSec}\nTitle=${chapter.chapterTitle}\nSummary=${chapter.chapterSummary}`,
            );
        }
        return { summaryOutput: "", type: "chapter", chapterOutput: chapters_res.chapters };
    }

    return { summaryOutput: "", type: "chapter", chapterOutput: [] }; //failed
}

async function createHighlight(state: typeof StateAnnotation.State) {
    if (!process.env.TL_VID_ID) {
        throw new Error("TL_VID_ID environment variable is not set");
    }

    const highlights_res = await client.summarize({
        videoId: process.env.TL_VID_ID,
        type: "highlight",
        prompt: state.userQuery,
    });

    if (
        "highlights" in highlights_res &&
        Array.isArray(highlights_res.highlights)
    ) {
        const highlights: z.infer<typeof highlightObjectSchema>[] = highlights_res.highlights.filter((highlight): highlight is z.infer<typeof highlightObjectSchema> => (
            typeof highlight.highlight === 'string' &&
            typeof highlight.startSec === 'number' &&
            typeof highlight.endSec === 'number'
        ));

        for (const highlight of highlights) {
            console.log(
                `Highlight: ${highlight.highlight}, start: ${highlight.startSec}, end: ${highlight.endSec}`,
            );
        }
        return { summaryOutput: "", type: "highlight", highlightOutput: highlights_res.highlights };
    }
    return { summaryOutput: "", type: "highlight", highlightOutput: [] }; //failed
}

export default async function twelveLabsProcessor(query: string) {
    const state = await agentWorkflow.invoke({
        userQuery: query
    })

    const dataPayload = {
        type: state.type, //tells frontend which one is populated
        summaryOutput: state.summaryOutput,
        chapterOutput: state.chapterOutput,
        highlightOutput: state.highlightOutput,
    }

    return dataPayload
}
