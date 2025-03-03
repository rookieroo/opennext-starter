// @ts-nocheck
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

class CloudflareSync {
  constructor() {
    this.initializeArgs();
    this.env = process.env.NODE_ENV || 'development';
    this.config = this.loadConfig();
  }

  initializeArgs() {
    this.argv = yargs(hideBin(process.argv))
      .options({
        migrate: {
          type: 'boolean',
          description: 'DB migrations',
        },
        preview: {
          type: 'boolean',
          description: 'Deploy to preview environment',
        },
        local: {
          type: 'boolean',
          description: 'Run in local mode',
        },
        remote: {
          type: 'boolean',
          description: 'Run in remote mode',
        },
        'dry-run': {
          type: 'boolean',
          description: 'Show what would be done without making changes',
        },
        'skip-secrets': {
          type: 'boolean',
          description: 'Skip secrets sync',
        },
        'skip-vars': {
          type: 'boolean',
          description: 'Skip vars sync',
        },
      })
      .conflicts('local', 'remote')
      .conflicts('preview', 'remote').argv;
  }

  loadConfig() {
    const config = {};
    const envPrefix = this.env;

    // Load environment-specific .env file
    const envFile = `.env.${envPrefix}`;
    if (fs.existsSync(envFile)) {
      Object.assign(config, dotenv.parse(fs.readFileSync(envFile)));
    }

    // Load vars file
    const varsFile = `.${envPrefix}.vars`;
    if (fs.existsSync(varsFile)) {
      config.vars = dotenv.parse(fs.readFileSync(varsFile));
    }

    // Load secrets file
    const secretsFile = `.${envPrefix}.secrets`;
    if (fs.existsSync(secretsFile)) {
      config.secrets = dotenv.parse(fs.readFileSync(secretsFile));
    }

    return config;
  }

  async execCommand(command, options = {}) {
    if (this.argv['dry-run']) {
      console.log(`Would execute: ${command}`);
      return null;
    }

    try {
      return execSync(command, {
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options,
      });
    } catch (error) {
      if (options.ignoreError) return null;
      throw error;
    }
  }

  async bulkSetCloudflareSecrets() {
    try {
      const secretsJson = JSON.stringify(this.config.secrets, null, 2);
      fs.writeFileSync('secrets.json', secretsJson);

      if (this.config.CLOUDFLARE_WORKERS_NAME) {
        console.log('Setting secrets for Workers...');
        execSync('wrangler secret bulk secrets.json', { stdio: 'inherit' });
      }
      fs.unlinkSync("secrets.json");

      console.log('✅ Successfully set all secrets in Cloudflare');
    } catch (error) {
      console.error('❌ Error setting secrets:', error);
      process.exit(1);
    }
  }

  async singleSetCloudflareSecrets() {
    if (this.argv['skip-secrets'] || !this.config.secrets) return;

    console.log('\n🔒 Syncing secrets...');

    for (const [key, value] of Object.entries(this.config.secrets)) {
      try {
        if (this.config.CLOUDFLARE_PAGES_NAME) {
          await this.execCommand(
            `echo "${value}" | npx wrangler pages secret put ${key} ` +
              `--project-name=${this.config.CLOUDFLARE_PAGES_NAME}`,
            { silent: true }
          );
        }
        if (this.config.CLOUDFLARE_WORKERS_NAME) {
          await this.execCommand(
            `echo "${value}" | npx wrangler secret put ${key} ` +
              `--name=${this.config.CLOUDFLARE_WORKERS_NAME}`,
            { silent: true }
          );
        }
        console.log(`✅ Set secret: ${key}`);
      } catch (error) {
        console.error(`❌ Failed to set secret ${key}:`, error.message);
      }
    }
  }

  async sync() {
    console.log(`\n🚀 Starting Cloudflare sync for ${this.env} environment`);
    console.log(
      `Mode: ${this.argv.local ? 'Local' : this.argv.remote ? 'Remote' : 'Default'}`
    );
    console.log(`Preview: ${this.argv.preview ? 'Yes' : 'No'}`);

    try {
      await this.bulkSetCloudflareSecrets();
      // await this.singleSetCloudflareSecrets();
      console.log('\n✨ Sync completed successfully!');
    } catch (error) {
      console.error('\n❌ Sync failed:', error.message);
      process.exit(1);
    }
  }
}

export { CloudflareSync };

async function main() {
  const cloudflareSync = new CloudflareSync();
  cloudflareSync.sync();
}

main().catch(console.error);
