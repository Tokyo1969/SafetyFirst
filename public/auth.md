# Safety First auth.md

## Agent audience

This document is for automated agents discovering authentication and registration
capabilities for the Safety First website.

## Registration and provisioning

Agent registration is not supported. There are no public agent registration,
account provisioning, credential claiming, or token issuance endpoints.
No registration methods are supported, including anonymous registration,
verified-email registration, or identity assertions.

The website's chat and consultation form use internal application functions.
They are not public APIs or agent registration endpoints. Do not submit forms
or invoke these functions to probe registration support.

## Credentials and OAuth

Public website pages and discovery documents can be read without credentials.
Do not send bearer tokens, API keys, passwords, or identity assertions to them.
Safety First does not issue agent credentials or advertise an OAuth authorization
server, supported OAuth scopes, or bearer authentication methods.

OAuth Protected Resource Metadata and OAuth Authorization Server metadata are
not published because no public OAuth-protected API is offered.

## Public discovery and access

- [API catalog](/.well-known/api-catalog): currently lists no public APIs.
- [Content usage preferences](/robots.txt): access does not grant permission for
  uses disallowed by the published Content Signals.
- To request a Markdown version of a website page, send `Accept: text/markdown`.
