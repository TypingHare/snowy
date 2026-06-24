### Snowy Subdomain Spec

This is a specification for the subdomains of the Snowy project.

#### Preliminaries

In a **fully qualified domain name (FQDN)**, there are two to three levels of domain names separated by dots:

- The **top-level domain (TLD)** is the last part of the domain name, such as `.com`, `.org`, or `.net`.
- The **second-level domain (SLD)** is the part of the domain name that comes before the TLD.
- The **subdomain** is the part of the domain name that comes before the SLD. It, including the dot after it, is optional.

Take `sub.example.com` as an example. The TLD is `.com`, the SLD is `example`, and the subdomain is `sub`. If there is no subdomain, the domain name would simply be `example.com`.

#### Subdomains

##### Empty Subdomain

The empty subdomain should be used for the "about me" application, which contains a self-introduction, resume, links to social media, a gallery, and other personal information.

##### Blog Subdomain

The `blog` subdomain should contain static blog posts, which are generated from Markdown files, LaTeX files, or other formats. The `/` path of the `blog` subdomain should be a portal page that lists all blog posts as clickable links.

##### Docs Subdomain

The `docs` subdomain should contain static documents that are not classified as blog posts. The `/` path of the `docs` subdomain should be a portal page that lists all documents as clickable links.

##### Static Subdomain

The `static` subdomain should contain static resources that are not classified as documents. This includes images, videos, and other media files.

##### App Subdomain

The `app` subdomain should contain hosted applications. The name of the application should be the first part of the path after the `/` in the URL. For example, if the app is named `myapp`, the URL would be `https://app.example.com/myapp`.

#### Environment Variables

All applications in this environment can assume the following environment variables are set:

- `TOP_LEVEL_DOMAIN`: The TLD of the domain name.
- `SECOND_LEVEL_DOMAIN`: The SLD of the domain name.
- `STATIC_SUBDOMAIN`: The subdomain for the static resource site, if applicable.
- `DOCS_SUBDOMAIN`: The subdomain for the documentation site, if applicable.
- `APP_SUBDOMAIN`: The subdomain for the application site, if applicable.
  Below are the values for these environment variables on Snowy:

```bash
export TOP_LEVEL_DOMAIN="life"
export SECOND_LEVEL_DOMAIN="jameschen"
export STATIC_SUBDOMAIN="static"
export DOCS_SUBDOMAIN="docs"
export APP_SUBDOMAIN="app"
```
