// Test file to verify Unicode encoding fix
import { encodeToBase64 } from '../sampleData';

// Test the encoding function with Unicode characters
const testStrings = [
  "Simple ASCII text",
  "Text with emojis: 🎉 🔬 ✅ 🚀 📚",
  "Mixed content: Hello 世界 🌍",
  "Complex unicode: àáâãäåæçèéêë",
  "Symbols: ©®™€£¥§¶†‡•…‰‹›\"''–—"
];

console.log('Testing Unicode encoding:');
testStrings.forEach((str, index) => {
  try {
    const encoded = encodeToBase64(str);
    console.log(`Test ${index + 1}: ✅ Success`);
    console.log(`Input: "${str}"`);
    console.log(`Encoded length: ${encoded.length}`);
    console.log('---');
  } catch (error) {
    console.log(`Test ${index + 1}: ❌ Failed`);
    console.log(`Error: ${error}`);
    console.log('---');
  }
});