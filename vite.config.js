import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const execFileAsync = promisify(execFile);

function localTtsPlugin() {
  return {
    name: 'local-macos-tts',
    configureServer(server) {
      server.middlewares.use('/api/tts', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        try {
          const body = await new Promise((resolve, reject) => {
            let data = '';
            req.on('data', (chunk) => {
              data += chunk;
            });
            req.on('end', () => resolve(JSON.parse(data || '{}')));
            req.on('error', reject);
          });

          const text = String(body.text || '').trim();
          if (!text) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Text is required' }));
            return;
          }

          const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'recoveryiq-tts-'));
          const aiffPath = path.join(tempDir, 'speech.aiff');
          const wavPath = path.join(tempDir, 'speech.wav');

          await execFileAsync('say', ['-v', 'Samantha', '-o', aiffPath, text]);
          await execFileAsync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@22050', aiffPath, wavPath]);

          const audio = await fs.readFile(wavPath);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'audio/wav');
          res.setHeader('Cache-Control', 'no-store');
          res.end(audio);

          await fs.rm(tempDir, { recursive: true, force: true });
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error?.message || 'TTS generation failed' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localTtsPlugin()],
});
