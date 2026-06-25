### Snowy Subdomain Spec

This is a specification for the subdomains of the Snowy project.

#### Preliminaries

In a **fully qualified domain name (FQDN)**, there are two or more levels of domain names separated by dots:

- The **top-level domain (TLD)** is the last part of the domain name, such as `.com`, `.org`, or `.net`.
- The **second-level domain (SLD)** is the part of the domain name that comes before the TLD.
- The **subdomain** is the optional part of the domain name that comes before the SLD, separated from it by a dot. It may consist of one or more dot-separated labels (e.g. `www` or `mail.internal`). When omitted, the domain name consists of just the SLD and TLD (e.g. `example.com`).

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

- `TOP_LEVEL_DOMAIN`: The TLD of the domain name excluding the dot (e.g., `com` or `org`).
- `SECOND_LEVEL_DOMAIN`: The SLD of the domain name.
- `BLOG_SUBDOMAIN`: The subdomain for the blog site.
- `STATIC_SUBDOMAIN`: The subdomain for the static resource site.
- `DOCS_SUBDOMAIN`: The subdomain for the documentation site.
- `APP_SUBDOMAIN`: The subdomain for the application site.

Below are the values for these environment variables on Snowy:

```bash
export TOP_LEVEL_DOMAIN="com"
export SECOND_LEVEL_DOMAIN="example"
export BLOG_SUBDOMAIN="blog"
export STATIC_SUBDOMAIN="static"
export DOCS_SUBDOMAIN="docs"
export APP_SUBDOMAIN="app"
```

For example, the FQDN for the blog subdomain can be constructed as follows:

```bash
blog_fqdn="${BLOG_SUBDOMAIN}.${SECOND_LEVEL_DOMAIN}.${TOP_LEVEL_DOMAIN}"
```
