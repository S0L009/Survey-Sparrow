export async function blobToWavBase64(blob: { arrayBuffer: () => any; }) {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioCtx = new AudioContext();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      
      // OfflineAudioContext for rendering WAV
      const offlineCtx = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineCtx.destination);
      source.start();
      
      const renderedBuffer = await offlineCtx.startRendering();

      // Convert rendered buffer to WAV bytes
      function encodeWAV(buffer: AudioBuffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitsPerSample = 16;
        const samples = buffer.getChannelData(0);
        const bufferLength = samples.length * 2 + 44;
        const wavBuffer = new ArrayBuffer(bufferLength);
        const view = new DataView(wavBuffer);

        function writeString(view: DataView<ArrayBuffer>, offset: number, string: string) {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        }

        let offset = 0;
        writeString(view, offset, 'RIFF'); offset += 4;
        view.setUint32(offset, 36 + samples.length * 2, true); offset += 4;
        writeString(view, offset, 'WAVE'); offset += 4;
        writeString(view, offset, 'fmt '); offset += 4;
        view.setUint32(offset, 16, true); offset += 4;          // Subchunk1Size (16 for PCM)
        view.setUint16(offset, format, true); offset += 2;      // AudioFormat (1 for PCM)
        view.setUint16(offset, numChannels, true); offset += 2; // NumChannels
        view.setUint32(offset, sampleRate, true); offset += 4;  // SampleRate
        view.setUint32(offset, sampleRate * numChannels * bitsPerSample / 8, true); offset += 4; // ByteRate
        view.setUint16(offset, numChannels * bitsPerSample / 8, true); offset += 2; // BlockAlign
        view.setUint16(offset, bitsPerSample, true); offset += 2;                   // BitsPerSample
        writeString(view, offset, 'data'); offset += 4;
        view.setUint32(offset, samples.length * 2, true); offset += 4;

        // Write PCM samples
        for (let i = 0; i < samples.length; i++, offset += 2) {
          const s = Math.max(-1, Math.min(1, samples[i]));
          view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
        return wavBuffer;
      }

      const wavBuffer = encodeWAV(renderedBuffer);

      // Convert WAV bytes to base64
      const wavUint8Array = new Uint8Array(wavBuffer);
      let binary = '';
      for (let i = 0; i < wavUint8Array.byteLength; i++) {
        binary += String.fromCharCode(wavUint8Array[i]);
      }
      const base64 = btoa(binary);
      resolve(base64);
    } catch (error) {
      reject(error);
    }
  });
}
