# BizDive Development Guide

Welcome to the BizDive development environment. This document provides instructions on how to maintain and check your development setup.

## Quick Status Check

You can check the health of your development environment (GitHub, Supabase, and Local Server) by running:

```bash
npm run status
```

This will verify:
- **Tools**: Node.js, npm, and Git versions.
- **GitHub**: Connection to the remote repository and current branch.
- **Supabase**: Connection to the database and question count.
- **Local Server**: Whether the development server is running on `http://localhost:3000`.

## Healthy Project Check

Before committing or after major changes, run the following to ensure there are no linting or type errors:

```bash
npm run check
```

## Troubleshooting

### PowerShell Execution Policy Error
If you encounter a "script execution is disabled" error when running `npx` or other scripts in PowerShell, run the following command in an **Administrator PowerShell** Window:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

### Supabase Connection
If the status check fails for Supabase, ensure your `.env.local` file contains the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Available Scripts

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run status`: Check environment health.
- `npm run check`: Run linting and type checking.
