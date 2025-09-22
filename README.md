## 🏆 HackRice – CodeFlowAI (1st Place: Best Use of MongoDB)

## Inspiration  
As students and developers, we often felt overwhelmed by the endless programming resources online. Generic tutorials rarely fit individual skill levels, leaving gaps in knowledge or reteaching concepts we already knew. We wanted a tool that adapts to *you* - your strengths, weaknesses, and goals.  

## What it does  
CodeFlowAI is an **AI-powered IDE assisted tutor**.  
- Users fill out a quick skill assessment form.  
- LangGraph + Google’s Gemini API generate a personalized learning roadmap.  
- Auth0 securely authenticates each user and ties progress to their account.  
- Curated video lessons are streamed directly from MongoDB GridFS to the dashboard.  
- A Warp CLI integration sets up the developer’s environment in VS Code through a bridge connection for hands-on practice.  

The result: a secure, scalable, and personalized content hub that helps learners grow efficiently.  

## How we built it  
- **Frontend**: React + Tailwind for a responsive and clean UI.  
- **Backend**: Node.js/Express to handle authentication, AI calls, and resource delivery.  
- **AI**: LangGraph orchestrating Gemini API to process assessments and generate dashboards.  
- **Video Training**: TwelveLabs API to classify programming videos (trained currently on common languages).  
- **Auth**: Auth0 to manage secure login and user-specific data.  
- **Dev Environment**: Warp CLI integrated to set up coding environments in VS Code.  
- **Data**: MongoDB GridFS to store and stream curated video lessons.  

## Challenges we ran into  
- Limited TwelveLabs API capacity meant we could only train on common programming languages for now.  
- Streaming large video files smoothly from GridFS took significant debugging.  
- Some minor UI bugs we couldn’t fully tweak out in time.  
- Getting Auth0 authentication flow to integrate seamlessly with user dashboards.  
- Orchestrating Warp CLI setup with VS Code bridges.  

## Accomplishments that we're proud of  
- Built a full end-to-end AI-driven learning dashboard in just one weekend.  
- Integrated LangGraph, Gemini, TwelveLabs, Auth0, GridFS, and Warp into a single cohesive app.  
- Streaming curated video lessons directly from GridFS to the dashboard.  
- Proving that we could personalize education dynamically while maintaining security.  

## What we learned  
- How to integrate multiple cutting-edge APIs into a single platform.  
- Best practices for secure authentication and scalable video streaming.  
- That even small UI polish takes time, and debugging in hackathon conditions requires tradeoffs.  
- The potential of tools like Warp CLI to bridge AI-generated guidance with hands-on coding practice.  

## What's next for CodeFlowAI  
- Expand TwelveLabs training to cover more programming languages and frameworks.  
- Add interactive coding exercises that adapt in real time to learner progress.  
- Increase course availability and resource variety for the agent to recommend.  
- Enhance UI/UX polish and bug fixes.  
- Scale to classrooms, bootcamps, and self-learners, evolving into a comprehensive adaptive learning ecosystem.  
