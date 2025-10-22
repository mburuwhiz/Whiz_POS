# WHIZ POS v2.0 - Admin Guide

This document provides instructions for administrative tasks for both Super Admins and Business Admins.

## Super Admin: Registering a New Business

As the Super Admin, you are the only one who can create new businesses.

1.  Log in using your designated `SUPER_ADMIN_EMAIL` and password.
2.  You will be redirected to the **Super Admin Dashboard**.
3.  Use the "Register New Business" form on this dashboard to create a new business and its first Business Admin user.
4.  Upon successful registration, a unique API key for the new business will be displayed. **Store this API key securely and provide it to the Business Admin.**

## Super Admin: Adding Additional Users to a Business

In addition to creating businesses, the Super Admin can add new users (e.g., Cashiers, Managers) to any existing business directly from the Super Admin Dashboard.

## Business Admin: Managing Users

As a Business Admin, you can manage the users for your business.

1.  Log in with your email and password.
2.  You will be redirected to the **Business Admin Dashboard**.
3.  From here, you can view all existing users and create new ones using the "Create New User" form.

## POS Device Setup

To link a POS terminal to a business, you must enter the business's unique API key into the POS login screen (`/pos-login`). This will fetch the list of users for that specific business, allowing for PIN-based login.
