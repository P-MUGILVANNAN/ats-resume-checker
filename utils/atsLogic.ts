import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

export const analyzeResume = async (
  resumeBase64: string, 
  mimeType: string, 
  jobDescription: string
): Promise<AnalysisResult> => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are an expert ATS (Applicant Tracking System) and Career Coach. 
    Analyze the attached resume against the provided Job Description.
    
    Job Description:
    ${jobDescription}

    Task:
    1. Extract keywords from the Job Description.
    2. Check if these keywords exist in the Resume.
    3. Identify missing critical keywords.
    4. Check for standard resume sections (Summary, Experience, Education, Skills).
    5. Evaluate the resume length and content density.
    6. Provide a score from 0-100 based on the match.
    7. Provide specific, actionable suggestions to improve the resume for this specific job.

    Output strict JSON adhering to the defined schema.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: resumeBase64
          }
        },
        {
          text: prompt
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "Overall match score 0-100" },
          scoreBreakdown: {
            type: Type.OBJECT,
            properties: {
              keywordScore: { type: Type.NUMBER, description: "Score out of 50 for keywords" },
              sectionScore: { type: Type.NUMBER, description: "Score out of 30 for sections" },
              lengthScore: { type: Type.NUMBER, description: "Score out of 20 for length" },
            },
            required: ["keywordScore", "sectionScore", "lengthScore"]
          },
          matchedKeywords: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Keywords found in both JD and Resume" 
          },
          missingKeywords: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Important keywords from JD missing in Resume"
          },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                found: { type: Type.BOOLEAN },
                message: { type: Type.STRING }
              },
              required: ["name", "found", "message"]
            }
          },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Actionable advice to improve the score"
          },
          wordCount: { type: Type.NUMBER, description: "Estimated word count of resume" }
        },
        required: ["score", "scoreBreakdown", "matchedKeywords", "missingKeywords", "sections", "suggestions", "wordCount"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  try {
    const result = JSON.parse(text) as AnalysisResult;
    return result;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Failed to analyze resume data.");
  }
};