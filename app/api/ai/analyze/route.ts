import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { AnalyzeRequest, AIAnalysis } from '@/lib/types'

// @google/genai — current Google SDK, compatible with AQ. format API keys
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequest = await req.json()
    const { tasks, availableHours, timeOfDay, userGoal } = body

    if (!tasks || tasks.length === 0) {
      return NextResponse.json(
        {
          briefing: 'No tasks found. Add some tasks and I will create a personalized action plan for you!',
          overloadDetected: false,
          prioritizedTasks: [],
          schedule: [],
          risks: [],
          recommendation: 'Start by adding your most important task with a deadline.',
          motivationalMessage: 'Every great achievement starts with a single task. Add yours now! 🚀',
        } satisfies AIAnalysis,
        { status: 200 }
      )
    }

    const totalEstimatedHours = tasks
      .filter((t) => t.status !== 'completed')
      .reduce((sum, t) => sum + t.estimatedDuration, 0) / 60

    const pendingTasks = tasks.filter((t) => t.status !== 'completed')

    const taskSummary = pendingTasks
      .map(
        (t, i) =>
          `${i + 1}. "${t.title}" | Priority: ${t.priority} | Deadline: ${t.deadline} | Est: ${t.estimatedDuration}min | Difficulty: ${t.difficulty}/5 | Category: ${t.category}`
      )
      .join('\n')

    const today = new Date().toISOString().split('T')[0]

    const prompt = `You are FlowMind AI — a highly intelligent productivity assistant powered by Gemini. Your job is to analyze a user's tasks and return a structured JSON action plan.

TODAY: ${today}
TIME OF DAY: ${timeOfDay}
AVAILABLE HOURS TODAY: ${availableHours} hours
TOTAL ESTIMATED WORK: ${totalEstimatedHours.toFixed(1)} hours
${userGoal ? `USER GOAL: ${userGoal}` : ''}

TASKS TO ANALYZE:
${taskSummary}

Respond with a valid JSON object (no markdown, no code blocks, just pure JSON) matching this exact structure:
{
  "briefing": "2-3 sentence personalized briefing summarizing the user's situation and most important focus",
  "overloadDetected": true or false (true if totalEstimatedHours > availableHours * 1.3),
  "overloadMessage": "Brief message if overloaded, explaining the situation and what to prioritize (null if not overloaded)",
  "prioritizedTasks": [
    { "taskId": "task_title_here", "rank": 1, "reason": "Why this is ranked first" },
    ...up to 5 tasks
  ],
  "schedule": [
    { "time": "9:00 AM", "taskTitle": "Task name", "duration": "2h", "note": "Focus tip or strategy" },
    ...realistic time blocks for today based on availableHours
  ],
  "risks": [
    { "taskTitle": "Task name", "risk": "What could go wrong", "recommendation": "How to mitigate" },
    ...only include tasks with real risks
  ],
  "recommendation": "One clear, actionable recommendation for maximum productivity today",
  "motivationalMessage": "One short, energizing message to motivate the user (max 1 sentence)"
}

Rules:
- Be specific and actionable, not generic
- Consider deadline urgency heavily (tasks due soon = higher priority)
- Consider difficulty (hard tasks = schedule during peak hours)
- Detect overload if work hours significantly exceed available hours
- Keep schedule realistic within availableHours
- Use task titles (not IDs) in prioritizedTasks.taskId field
- Return ONLY valid JSON, nothing else`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    })

    const rawText = response.text?.trim() || ''

    // Parse the JSON response
    let analysis: AIAnalysis
    try {
      // Robustly extract the JSON object even if Gemini wraps it in markdown or conversational text
      const match = rawText.match(/\{[\s\S]*\}/)
      if (!match) {
        throw new Error('No JSON object found in response')
      }
      analysis = JSON.parse(match[0])
    } catch {
      console.error('Failed to parse Gemini response:', rawText)
      return NextResponse.json(
        { error: 'AI response could not be parsed. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(analysis, { status: 200 })
  } catch (error) {
    console.error('AI analyze error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI analysis. Please check your API key and try again.' },
      { status: 500 }
    )
  }
}
