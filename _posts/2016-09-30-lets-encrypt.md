---
layout: post
published: true
title: "Use Let's Encrypt to automate SSL"
date: 2016-09-30T19:01:52.415Z
tags:
  - code
ogtype: article
bodyclass: post
---

[Let's Encrypt](https://letsencrypt.org/) is a Certificate Authority (CA) that provides an easy way to obtain and install free TLS/SSL certificates, thereby enabling encrypted HTTPS on web servers. It simplifies the process by providing a software client, certbot, that attempts to automate most (if not all) of the required steps.

We use Let's Encrypt as we can automate the process of obtaining and renewing SSL certs quickly.

This tutorial will assume a few things:

1. You must own or control the registered domain name that you wish to use the certificate with. If you do not already have a registered domain name, you may register one with one of the many domain name registrars out there (e.g. Namecheap, GoDaddy, etc.).
2. If you haven't already, be sure to create an A Record that points your domain to the public IP address of your server. This is required because of how Let's Encrypt validates that you own the domain it is issuing a certificate for. For example, if you want to obtain a certificate for example.com, that domain must resolve to your server for the validation process to work. Our setup will use example.com and www.example.com as the domain names, so both DNS records are required.
3. Once you have all of the prerequisites out of the way, let's move on to installing the certbot-auto Let's Encrypt client software.

###  1 — Install Let's Encrypt Client

The first step to using Let's Encrypt to obtain an SSL certificate is to install the certbot-auto software on your server. Currently, the best way to install the certbot-auto client is to download it from the EFF's download site. The client will automatically pull down available updates as necessary after installation.

We can download the `certbot-auto` Let’s Encrypt client to the `/usr/local/sbin` directory by typing:

```
cd /usr/local/sbin
sudo wget https://dl.eff.org/certbot-auto
```

You should now have a copy of `certbot-auto` in the /usr/local/sbin directory.

Make the script executable by typing:

```
sudo chmod a+x /usr/local/sbin/certbot-auto
```

The `certbot-auto` client should now be ready for use.

###  2 — Obtain a Certificate

The Webroot plugin works by placing a special file in the `/.well-known directory` within your document root, which can be opened (through your web server) by the Let's Encrypt client for validation. Depending on your configuration, you may need to explicitly allow access to the `/.well-known` directory.

I'm going to assume you're using NGINX as your web server, if you haven't installed it yet, do so with this command:

```
sudo apt-get update
sudo apt-get install nginx
```

To ensure that the directory is accessible to `certbot-auto` for validation, we'll need to make a quick change to our Nginx configuration.

By default, it's located at `/etc/nginx/sites-available/default`:

```
sudo nano /etc/nginx/sites-available/default
```

Inside the server block, add this location block:

```
# Add to SSL server block
server {
        . . .

        location ~ /.well-known {
                allow all;
        }

        . . .
}
```

You will also want to look up what your document root is set to by searching for the root directive, as the path is required to use the  Webroot plugin. If you're using the default configuration file, the root will be `/usr/share/nginx/html`.

Save and exit.

Check the configuration file for syntax errors:

```
sudo nginx -t
```

If all is well, restart Nginx:

```
sudo service nginx restart
```

Now that we know our webroot-path, we can use the Webroot plugin to request an SSL certificate with these commands. Here, we are also specifying our domain names with the -d option. If you want a single cert to work with multiple domain names (e.g. example.com and www.example.com), be sure to include all of them, starting with the most high level domain (e.g. example.com). Also, make sure that you replace the highlighted parts with the appropriate webroot path and domain name(s):

```
certbot-auto certonly -a webroot --webroot-path=/usr/share/nginx/html -d example.com -d www.example.com
```

_Let's Encrypt does not yet support wildcard SSL certificates, but you can use `-d` to add as many domains or subdomains you want, as long as they are hosted on this server._

Note: The certbot-auto software requires sudo user privileges, so you will be required to enter your password if you haven't used sudo recently.

After certbot-auto initializes, you will be prompted for some information. The exact prompts may vary depending on if you've used the certbot-auto client before, but we'll step you through the first time.

At the prompt, enter an email address that will be used for notices and lost key recovery.

Then you must agree to the Let's Encrypt Subscribe Agreement. Select `Agree`.

If everything was successful, you should see an output message that looks something like this:

```
IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at
   /etc/letsencrypt/live/example.com/fullchain.pem. Your
   cert will expire on 2016-12-17. To obtain a new version of the
   certificate in the future, simply run Let's Encrypt again.
 - Your account credentials have been saved in your Let's Encrypt
   configuration directory at /etc/letsencrypt. You should make a
   secure backup of this folder now. This configuration directory will
   also contain certificates and private keys obtained by Let's
   Encrypt so making regular backups of this folder is ideal.
 - If like Let's Encrypt, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
```

You will want to note the path and expiration date of your certificate, which was highlighted in the example output.

### Certificate Files

After obtaining the cert, you will have the following PEM-encoded files:

- cert.pem: Your domain's certificate
- chain.pem: The Let's Encrypt chain certificate
- fullchain.pem: cert.pem and chain.pem combined
- privkey.pem: Your certificate's private key

It's important that you are aware of the location of the certificate files that were just created, so you can use them in your web server configuration. The files themselves are placed in a subdirectory in /etc/letsencrypt/archive. However, the Let's Encrypt client creates symbolic links to the most recent certificate files in the /etc/letsencrypt/live/your_domain_name directory. Because the links will always point to the most recent certificate files, this is the path that you should use to refer to your certificate files.

You can check that the files exist by running this command (substituting in your domain name):

```
sudo ls -l /etc/letsencrypt/live/your_domain_name
```

The output should be the four previously mentioned certificate files. In a moment, you will configure your web server to use fullchain.pem as the certificate file, and privkey.pem as the certificate key file.

### Generate Strong Diffie-Hellman Group

To further increase security, you should also generate a strong Diffie-Hellman group. To generate a 2048-bit group, use this command:

```
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
```

This may take a few minutes but when it's done you will have a strong DH group at /etc/ssl/certs/dhparam.pem.

###  3 — Configure TLS/SSL on Web Server (Nginx)

Now that you have an SSL certificate, you need to configure your Nginx web server to use it.

Edit the Nginx configuration that contains your server block. Again, it's at /etc/nginx/sites-available/default by default:

```
sudo nano /etc/nginx/sites-available/default
```

Find the server block. Comment out or delete the lines that configure this server block to listen on port 80. In the default configuration, these two lines should be deleted:

```
        listen 80 default_server;
        listen [::]:80 default_server ipv6only=on;
```

We are going to configure this server block to listen on port 443 with SSL enabled instead. Within your server { block, add the following lines but replace all of the instances of example.com with your own domain:

```
        listen 443 ssl;

        server_name example.com www.example.com;

        ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
```

This enables your server to use SSL, and tells it to use the Let's Encrypt SSL certificate that we obtained earlier.

To allow only the most secure SSL protocols and ciphers, and use the strong Diffie-Hellman group we generated, add the following lines to the same server block:

```
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_prefer_server_ciphers on;
        ssl_dhparam /etc/ssl/certs/dhparam.pem;
        ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:AES:CAMELLIA:DES-CBC3-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!aECDH:!EDH-DSS-DES-CBC3-SHA:!EDH-RSA-DES-CBC3-SHA:!KRB5-DES-CBC3-SHA';
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_stapling on;
        ssl_stapling_verify on;
        add_header Strict-Transport-Security max-age=15768000;
```

Lastly, outside of the original server block (that is listening on HTTPS, port 443), add this server block to redirect HTTP (port 80) to HTTPS. Be sure to replace the highlighted part with your own domain name:

```
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}
```

Save and exit.

Test the configuration file for syntax errors by typing:

```
sudo nginx -t
```

Once you have verified that there are no syntax errors, put the changes into effect by restarting Nginx:

```
sudo service nginx restart
```

The Let's Encrypt TLS/SSL certificate is now in place. At this point, you should test that the TLS/SSL certificate works by visiting your domain via HTTPS in a web browser.

If you want to see how your server configuration scores, then you can use the Qualys SSL Labs Report to see how your server configuration scores:

```
https://www.ssllabs.com/ssltest/analyze.html?d=example.com
```

This SSL setup should report an A+ rating.

### 4 — Set Up Auto Renewal

Let’s Encrypt certificates are valid for 90 days, but it’s recommended that you renew the certificates every 60 days to allow a margin of error. At the time of this writing, automatic renewal is still not available as a feature of the client itself, but you can manually renew your certificates by running the certbot-auto client with the renew option.

To trigger the renewal process for all installed domains, run this command:

```
certbot-auto renew
```

Because we recently installed the certificate, the command will only check for the expiration date and print a message informing that the certificate is not due to renewal yet. The output should look similar to this:

Output:

```
Checking for new version...
Requesting root privileges to run letsencrypt...
   /home/roger/.local/share/letsencrypt/bin/letsencrypt renew
Processing /etc/letsencrypt/renewal/example.com.conf

The following certs are not due for renewal yet:
  /etc/letsencrypt/live/example.com/fullchain.pem (skipped)
No renewals were attempted.
```

Notice that if you created a bundled certificate with multiple domains, only the base domain name will be shown in the output, but the renewal should be valid for all domains included in this certificate.

A practical way to ensure your certificates won’t get outdated is to create a cron job that will periodically execute the automatic renewal command for you. Since the renewal first checks for the expiration date and only executes the renewal if the certificate is less than 30 days away from expiration, it is safe to create a cron job that runs every week or even every day, for instance.

Let's edit the crontab to create a new job that will run the renewal command every week. To edit the crontab for the root user, run:

```
sudo crontab -e
```

Add the following lines:

```
30 2 * * 1 /usr/local/sbin/certbot-auto renew >> /var/log/certbot.log
35 2 * * 1 /etc/init.d/nginx reload
```

Save and exit.

This will create a new cron job that will execute the certbot-auto renew command every Monday at 2:30 am, and reload Nginx at 2:35am (so the renewed certificate will be used). The output produced by the command will be piped to a log file located at /var/log/certbot.log.
