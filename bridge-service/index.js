import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// State management
let projectPath = '';
let events = [];
let executedEvents = new Set();
let isConnected = false;

// Utility functions
function expandHomePath(filepath) {
  if (!filepath) return filepath;
  if (filepath.startsWith('~/')) {
    return path.join(os.homedir(), filepath.slice(2));
  }
  return filepath;
}

async function executeCommandInWarp(command, workingDirectory = null) {
  try {
    const cwd = workingDirectory ? expandHomePath(workingDirectory) : projectPath || process.cwd();
    console.log(`📟 Sending command to Warp: ${command} in ${cwd}`);
    
    // Method 1: Try using a shell script approach that's more reliable
    try {
      // Create a temporary shell script that opens Warp and executes the command
      const scriptContent = `#!/bin/bash
cd "${cwd}"
osascript -e 'tell application "Warp" to activate'
sleep 1
osascript -e 'tell application "System Events" to tell process "Warp" to keystroke "cd '"'"'${cwd}'"'"'"'
sleep 0.5
osascript -e 'tell application "System Events" to tell process "Warp" to keystroke return'
sleep 0.5
osascript -e 'tell application "System Events" to tell process "Warp" to keystroke "${command}"'
sleep 0.3
osascript -e 'tell application "System Events" to tell process "Warp" to keystroke return'
`;
      
      const scriptPath = '/tmp/warp_exec.sh';
      await fs.writeFile(scriptPath, scriptContent);
      await execAsync(`chmod +x ${scriptPath}`);
      await execAsync(scriptPath);
      await fs.unlink(scriptPath);
      
      console.log(`✅ Command sent to Warp via script: ${command}`);
      return { success: true, sentToWarp: true };
      
    } catch (scriptError) {
      console.log(`Script method failed: ${scriptError.message}`);
      
      // Method 2: Simpler approach - just open Warp and let user run manually
      await execAsync(`open -a Warp`);
      console.log(`⚠️ Opened Warp - please run manually: cd '${cwd}' && ${command}`);
      return { success: true, sentToWarp: true, manual: true };
    }
    
  } catch (error) {
    console.error(`❌ Failed to send command to Warp: ${error.message}`);
    console.log(`🔄 Falling back to background execution...`);
    
    // Fallback - execute in background and capture output
    const cwd = workingDirectory ? expandHomePath(workingDirectory) : projectPath || process.cwd();
    const { stdout, stderr } = await execAsync(command, { cwd });
    console.log(`Background execution output: ${stdout}`);
    if (stderr) console.log(`Background stderr: ${stderr}`);
    return { success: true, sentToWarp: false, stdout, stderr };
  }
}

async function applyEvent(event) {
  const { type, data } = event;
  
  try {
    switch (type) {
      case 'project_setup':
        projectPath = expandHomePath(data.working_directory);
        console.log(`Setting up project at: ${projectPath}`);
        
        // Create project directory
        await fs.mkdir(projectPath, { recursive: true });
        
        // Open VS Code if specified
        if (data.ide === 'vscode') {
          await execAsync(`code "${projectPath}"`);
        }
        
        // Configure Warp AI if there's context
        if (data.warp_context) {
          console.log(`Configuring Warp AI with context: ${data.warp_context}`);
          // Note: Warp AI configuration would need Warp's API when available
        }
        break;

      case 'file_create':
        if (!projectPath) {
          console.error('No project path set for file creation');
          return;
        }
        
        const filePath = path.join(projectPath, data.path);
        const fileDir = path.dirname(filePath);
        
        // Ensure directory exists
        await fs.mkdir(fileDir, { recursive: true });
        
        // Create file with content
        const content = data.content || '';
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`Created file: ${filePath}`);
        break;

      case 'code_modify':
        if (!projectPath) {
          console.error('No project path set for code modification');
          return;
        }
        
        const modifyFilePath = path.join(projectPath, data.path);
        let existingContent = '';
        
        // Read existing content if file exists
        try {
          existingContent = await fs.readFile(modifyFilePath, 'utf8');
        } catch (error) {
          console.log(`File doesn't exist, creating new: ${modifyFilePath}`);
        }
        
        let newContent = existingContent;
        
        switch (data.modification_type) {
          case 'clear_file':
            newContent = data.new_content || '';
            break;
            
          case 'add_line':
            const lines = existingContent.split('\n');
            const lineNumber = data.line_number || lines.length + 1;
            const insertIndex = Math.max(0, lineNumber - 1);
            
            // Ensure we have enough lines
            while (lines.length < insertIndex) {
              lines.push('');
            }
            
            lines.splice(insertIndex, 0, data.code_to_add || '');
            newContent = lines.join('\n');
            break;
            
          case 'replace_line':
            const replaceLines = existingContent.split('\n');
            const replaceLineNumber = data.line_number || 1;
            const replaceIndex = Math.max(0, replaceLineNumber - 1);
            
            if (replaceIndex < replaceLines.length) {
              replaceLines[replaceIndex] = data.new_content || '';
            }
            newContent = replaceLines.join('\n');
            break;
            
          case 'add_multiple_lines':
            const multiLines = existingContent.split('\n');
            const startLineNumber = data.starting_line_number || multiLines.length + 1;
            const startIndex = Math.max(0, startLineNumber - 1);
            
            // Ensure we have enough lines
            while (multiLines.length < startIndex) {
              multiLines.push('');
            }
            
            const codesToAdd = (data.code_to_add || '').split('\n');
            multiLines.splice(startIndex, 0, ...codesToAdd);
            newContent = multiLines.join('\n');
            break;
            
          default:
            console.warn(`Unknown modification type: ${data.modification_type}`);
            return;
        }
        
        // Ensure directory exists
        await fs.mkdir(path.dirname(modifyFilePath), { recursive: true });
        
        // Write the modified content
        await fs.writeFile(modifyFilePath, newContent, 'utf8');
        console.log(`Modified file: ${modifyFilePath} (${data.modification_type})`);
        break;

      case 'command':
        const workingDir = data.working_directory || projectPath;
        console.log(`🎬 Tutorial command: "${data.command}"`);
        if (data.context) console.log(`📝 Context: ${data.context}`);
        
        // Special handling for file operations that need to happen immediately
        if (data.command.startsWith('cp ') && data.command.includes('challenge')) {
          // Execute cp command directly in file system for immediate effect
          const cwd = expandHomePath(workingDir);
          try {
            await execAsync(data.command, { cwd });
            console.log(`📁 File copy executed directly: ${data.command}`);
            
            // Also send to Warp for visual feedback
            await executeCommandInWarp(data.command, workingDir);
          } catch (error) {
            console.error(`❌ File copy failed: ${error.message}`);
          }
        } else {
          // Regular commands go to Warp terminal
          const result = await executeCommandInWarp(data.command, workingDir);
          
          if (result.sentToWarp) {
            console.log(`🎯 Command executed in Warp terminal - check Warp for output!`);
          } else {
            console.log(`⚠️ Command executed in background (Warp unavailable)`);
          }
        }
        break;

      case 'challenge':
        console.log(`Challenge reached: ${data.title}`);
        // Challenge handling will be implemented later
        break;

      default:
        console.warn(`Unknown event type: ${type}`);
    }
  } catch (error) {
    console.error(`Error applying event: ${error.message}`);
  }
}

// API Routes

// Test connection
app.post('/connect', (req, res) => {
  isConnected = true;
  console.log('Bridge connected successfully');
  res.json({ success: true, message: 'Bridge connected' });
});

// Initialize project
app.post('/init-project', async (req, res) => {
  try {
    const { working_directory, ide } = req.body;
    
    projectPath = expandHomePath(working_directory || '~/codeflow_learn_python');
    console.log(`Initializing project at: ${projectPath}`);
    
    // Create project directory
    await fs.mkdir(projectPath, { recursive: true });
    
    // Open VS Code if specified
    if (ide === 'vscode') {
      await executeCommand(`code "${projectPath}"`);
    }
    
    res.json({ 
      success: true, 
      projectPath,
      message: 'Project initialized successfully' 
    });
  } catch (error) {
    console.error('Project initialization failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Load events from tutorial
app.post('/events/load', (req, res) => {
  try {
    const { events: tutorialEvents } = req.body;
    
    if (!Array.isArray(tutorialEvents)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Events must be an array' 
      });
    }
    
    events = tutorialEvents;
    executedEvents.clear();
    
    console.log(`Loaded ${events.length} events`);
    res.json({ 
      success: true, 
      totalEvents: events.length,
      message: 'Events loaded successfully' 
    });
  } catch (error) {
    console.error('Failed to load events:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Synchronize events based on video time
app.post('/sync', async (req, res) => {
  try {
    const { currentTime } = req.body;
    
    if (typeof currentTime !== 'number') {
      return res.status(400).json({ 
        success: false, 
        error: 'currentTime must be a number' 
      });
    }
    
    let appliedCount = 0;
    
    // Apply all events that should have occurred by now, in order
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      
      // Skip if already executed
      if (executedEvents.has(i)) continue;
      
      // Apply if timestamp has passed
      if (event.timestamp <= currentTime) {
        await applyEvent(event);
        executedEvents.add(i);
        appliedCount++;
        
        // Add small delay between events with same timestamp to ensure proper order
        if (i + 1 < events.length && events[i + 1].timestamp === event.timestamp) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
    
    res.json({ 
      success: true, 
      appliedEvents: appliedCount,
      totalExecuted: executedEvents.size,
      currentTime 
    });
  } catch (error) {
    console.error('Sync failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Seek to specific time (fast-forward or rewind)
app.post('/seek', async (req, res) => {
  try {
    const { time } = req.body;
    
    if (typeof time !== 'number') {
      return res.status(400).json({ 
        success: false, 
        error: 'time must be a number' 
      });
    }
    
    console.log(`Seeking to time: ${time}`);
    
    // Clear executed events and re-apply up to the seek time
    executedEvents.clear();
    let appliedCount = 0;
    
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      
      if (event.timestamp <= time) {
        await applyEvent(event);
        executedEvents.add(i);
        appliedCount++;
      }
    }
    
    res.json({ 
      success: true, 
      seekTime: time,
      appliedEvents: appliedCount 
    });
  } catch (error) {
    console.error('Seek failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get challenge code for validation
app.post('/get-challenge-code', async (req, res) => {
  try {
    const { challengeFile } = req.body;
    
    if (!challengeFile || !projectPath) {
      return res.status(400).json({ 
        success: false, 
        error: 'Challenge file and project path required' 
      });
    }
    
    const filePath = path.join(projectPath, challengeFile);
    const code = await fs.readFile(filePath, 'utf8');
    
    res.json({ 
      success: true, 
      code,
      filePath 
    });
  } catch (error) {
    console.error('Failed to read challenge code:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test challenge solution
app.post('/test-challenge', async (req, res) => {
  try {
    const { challengeFile, workingDirectory } = req.body;
    
    if (!challengeFile) {
      return res.status(400).json({ 
        success: false, 
        error: 'Challenge file required' 
      });
    }
    
    const workingDir = workingDirectory ? expandHomePath(workingDirectory) : projectPath;
    const command = `python ${challengeFile}`;
    
    console.log(`🧪 Testing challenge: ${challengeFile}`);
    
    // Execute the challenge file in Warp terminal
    const result = await executeCommandInWarp(command, workingDir);
    
    if (result.sentToWarp) {
      if (result.manual) {
        res.json({ 
          success: true, 
          message: `Warp opened! Please run manually:\ncd '${workingDir}'\n${command}`,
          sentToWarp: true,
          manual: true
        });
      } else {
        res.json({ 
          success: true, 
          message: `✅ Challenge test sent to Warp terminal!\nCommand: ${command}`,
          sentToWarp: true 
        });
      }
    } else {
      res.json({ 
        success: true, 
        message: `🔄 Executed in background:\n${result.stdout || 'No output'}${result.stderr ? '\nErrors: ' + result.stderr : ''}`,
        sentToWarp: false,
        output: result.stdout || 'No output captured'
      });
    }
  } catch (error) {
    console.error('Challenge test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Push to GitHub (via Warp)
app.post('/push-to-github', async (req, res) => {
  try {
    const { repoName, commitMessage } = req.body;
    
    if (!projectPath) {
      return res.status(400).json({ 
        success: false, 
        error: 'No project path set' 
      });
    }
    
    const message = commitMessage || 'CodeFlow AI tutorial completion';
    
    // Initialize git if not already done
    await executeCommand('git init', projectPath);
    await executeCommand('git add .', projectPath);
    await executeCommand(`git commit -m "${message}"`, projectPath);
    
    if (repoName) {
      await executeCommand(`git remote add origin https://github.com/${repoName}.git`, projectPath);
      await executeCommand('git push -u origin main', projectPath);
    }
    
    res.json({ 
      success: true, 
      message: 'Code pushed to GitHub successfully' 
    });
  } catch (error) {
    console.error('GitHub push failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Reset bridge state
app.post('/reset', (req, res) => {
  projectPath = '';
  events = [];
  executedEvents.clear();
  
  console.log('Bridge state reset');
  res.json({ 
    success: true, 
    message: 'Bridge reset successfully' 
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    connected: isConnected,
    projectPath,
    eventsLoaded: events.length,
    executedEvents: executedEvents.size 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Bridge Service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
