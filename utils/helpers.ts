/**
 * 동적으로 외부 스크립트 로드
 */
export function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('document is not available'));
      return;
    }
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}

/**
 * AbortError 인지 판별
 */
export function isAbortError(e: unknown): boolean {
  return (e as { name?: string })?.name === 'AbortError';
}

/**
 * 병렬 실행 (동시성 제한)
 */
export async function runConcurrent<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
  signal?: AbortSignal
): Promise<void> {
  const queue = items.slice();
  const n = Math.max(1, Math.min(concurrency, queue.length || 1));
  const runners = Array.from({ length: n }, async () => {
    while (queue.length > 0) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const item = queue.shift()!;
      await worker(item);
    }
  });
  await Promise.all(runners);
}

/**
 * 프로젝트 ID 생성
 */
export function generateProjectId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 구글 검색 열기
 */
export function openWebSearch(query: string): void {
  const q = (query || "").trim();
  if (!q) return;
  try {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank', 'noopener,noreferrer');
  } catch {
    // ignore
  }
}

