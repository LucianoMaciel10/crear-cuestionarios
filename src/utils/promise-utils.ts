/**
 * Utilities for safer promise handling to prevent
 * "message channel closed" warnings in Chrome
 */

/**
 * Safely handles promises to prevent unhandled rejections
 * that might trigger Chrome's message channel warnings
 */
export function safePromise<T>(
  promise: Promise<T>,
  onSuccess?: (result: T) => void,
  onError?: (error: unknown) => void,
): Promise<T> {
  return promise
    .then((result) => {
      if (onSuccess) {
        try {
          onSuccess(result);
        } catch (error) {
          console.error("Error in promise success handler:", error);
        }
      }
      return result;
    })
    .catch((error) => {
      if (onError) {
        try {
          onError(error);
        } catch (handlerError) {
          console.error("Error in promise error handler:", handlerError);
        }
      }
      // Re-throw to maintain promise rejection
      throw error;
    });
}

/**
 * Wraps event listeners to ensure they don't
 * cause message channel issues
 */
export function safeEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  window.addEventListener(
    type,
    (event) => {
      try {
        Promise.resolve(listener.call(window, event)).catch((error) => {
          console.error(`Error in event listener for ${type}:`, error);
        });
      } catch (error) {
        console.error(`Error in event listener for ${type}:`, error);
      }
    },
    options,
  );
}
