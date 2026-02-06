# GB Insurance - Production Deployment Guide

This guide provides step-by-step instructions for deploying the GB Insurance application to the Internet Computer mainnet.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Build and Deploy Steps](#build-and-deploy-steps)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Admin Access Setup](#admin-access-setup)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying to production, ensure you have:

### Required Tools
- **dfx CLI** (version 0.15.0 or later): Internet Computer SDK
- **Node.js** (version 18 or later) and **pnpm** package manager
- **Internet Computer wallet** with sufficient cycles for deployment

### Required Accounts
- **Internet Computer Principal ID**: Your deployer identity
- **Cycles wallet**: Funded with at least 2-5 trillion cycles for initial deployment

### Verify Installation
