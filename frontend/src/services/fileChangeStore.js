let changes = [];
let listeners = new Set();
let setFileTrigger = null;

export function initFileChangeTrigger(triggerSetter) {
    setFileTrigger = triggerSetter;
}

export function addFileChange(change) {
    changes = [...changes, change];

    // Trigger React state
    if (setFileTrigger) {
        setFileTrigger(prev => prev + 1);
    }

    listeners.forEach((listener) => {
        listener(changes);
    });
}

export function getFileChanges() {
    return changes;
}

export function subscribeFileChanges(listener) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

export function clearFileChange(id) {
    changes = changes.filter(
        (change) => change.id !== id
    );
}