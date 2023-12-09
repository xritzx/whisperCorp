export function simpleHash(input: string) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash % 16).toString(16);
}

// use consistent hashing to hide address
export function maskHexAddress(hexAddress: string, unmaskedStartLength: any, unmaskedEndLength: number) {
    const totalLength = hexAddress.length;

    const start = hexAddress.substring(0, unmaskedStartLength);
    const end = hexAddress.substring(totalLength - unmaskedEndLength);

    const middle = hexAddress.substring(unmaskedStartLength, totalLength - unmaskedEndLength)
                     .split('')
                     .map(char => simpleHash(char))
                     .join('');

    return start + middle + end;
}