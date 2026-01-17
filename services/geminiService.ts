
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ViewType, Severity } from "../types";

const API_KEY = process.env.API_KEY || "";

export const analyzeBodyPosture = async (imageDataBase64: string, selectedView: ViewType): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `你是一位专业的形体美容与康复专家。请分析这张用户的${selectedView}照片。
  识别用户是否存在以下问题：
  - 如果是正面：高低肩、长短腿、O/X型腿、脊柱侧弯、骨盆侧倾等。
  - 如果是侧面：圆肩、头前伸（乌龟颈）、骨盆前倾/后倾、膝超伸、驼背等。
  
  请评估每个问题的严重程度（轻微、中度、严重），并按严重程度从重到轻排列。
  最后给出专业的改善建议。
  
  请注意：如果图像质量太差或无法识别人体，请在总结中说明。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: imageDataBase64.split(',')[1], mimeType: "image/jpeg" } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER, description: "形体健康总分（0-100）" },
            viewDetected: { type: Type.STRING, description: "检测到的视图类型" },
            summary: { type: Type.STRING, description: "整体评估总结" },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  issueName: { type: Type.STRING, description: "问题名称" },
                  severity: { type: Type.STRING, enum: ["严重", "中度", "轻微"], description: "严重程度" },
                  description: { type: Type.STRING, description: "详细描述" },
                  suggestion: { type: Type.STRING, description: "针对性建议" }
                },
                required: ["issueName", "severity", "description", "suggestion"]
              }
            }
          },
          required: ["overallScore", "viewDetected", "issues", "summary"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as AnalysisResult;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw error;
  }
};
