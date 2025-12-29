'use client';

import { useCallback } from 'react';

/**
 * Gemini API 호출 훅
 */
export function useAPI() {
  /**
   * 일반 Gemini API 호출 (동기식 응답)
   */
  const callGemini = useCallback(async (
    prompt: string,
    systemInstruction = "",
    signal?: AbortSignal
  ): Promise<string> => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  }, []);

  /**
   * 스트리밍 Gemini API 호출
   */
  const callGeminiStream = useCallback(async (
    prompt: string | Array<{ role: string; content: string }>,
    systemInstruction = "",
    onUpdate: (text: string) => void,
    generationConfig?: Record<string, unknown>,
    signal?: AbortSignal
  ): Promise<string> => {
    const body = Array.isArray(prompt)
      ? { messages: prompt, systemInstruction, generationConfig }
      : { prompt, systemInstruction, generationConfig };

    const response = await fetch('/api/generate-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith('data: ')) continue;
        const jsonStr = trimmedLine.slice(6);
        if (jsonStr === '[DONE]') continue;
        try {
          const data = JSON.parse(jsonStr);
          if (data.text) {
            accumulatedText += data.text;
            onUpdate(accumulatedText);
          }
        } catch {
          // ignore parse errors
        }
      }
    }
    return accumulatedText;
  }, []);

  /**
   * 이미지 생성 API 호출
   */
  const generateImage = useCallback(async (
    prompt: string,
    signal?: AbortSignal
  ): Promise<string> => {
    const response = await fetch('/api/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal,
    });

    if (!response.ok) {
      let errorMessage = `이미지 생성 실패 (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch {
          // 응답을 읽을 수 없는 경우
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data || !data.imageUrl) {
      throw new Error("서버에서 이미지 데이터를 받지 못했습니다. 다시 시도해주세요.");
    }

    return data.imageUrl;
  }, []);

  /**
   * 표지 컨셉 생성 API 호출
   */
  const generateCoverConcepts = useCallback(async (
    title: string,
    description: string,
    targetAudience: string
  ) => {
    const response = await fetch('/api/cover/concepts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, targetAudience })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Cover concept error: ${response.status}`);
    }

    return response.json();
  }, []);

  /**
   * 웹 팩트체크 API 호출
   */
  const factCheckWeb = useCallback(async (
    manuscript: string,
    claims: unknown[],
    signal?: AbortSignal
  ) => {
    const res = await fetch('/api/fact-check-web', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ manuscript, claims }),
      signal,
    });

    if (!res.ok) {
      throw new Error(`Fact check failed: ${res.status}`);
    }

    return res.json();
  }, []);

  return {
    callGemini,
    callGeminiStream,
    generateImage,
    generateCoverConcepts,
    factCheckWeb,
  };
}

