const randomSpeakableChar = (): string => {
    // 0 -5
    const randomNumberDigit = Math.floor(Math.random() * 5);

    switch (randomNumberDigit) {
        case 0:
            return 'A'; // Alpha
        case 1:
            return 'B'; // Beta
        case 2:
            return 'G'; // Gamma
        case 3:
            return 'D'; // Delta
        case 4:
            return 'E'; // Epsilon
        case 5:
            return 'S'; // Sigma
    }
};

export const randomSpeakableCharGenerator = (digits: number): string => {
    let code = '';
    for (let i = 1; i <= digits; i++) {
        code += randomSpeakableChar();
    }
    return code;
};
