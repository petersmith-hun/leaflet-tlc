export const blockExecution = (): Promise<void> => {

    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, 50);
    });
}
