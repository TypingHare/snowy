## Server

To build a personal website, we first need a **server**, on which we can deploy our web applications, such as a homepage, for others to access. A server is a computer that handles requests from other computers in a network. On the internet, every computer has a public IP address, which allows it to communicate with other computers. For example, when computer `A` sends a request to computer `B`, and `B` returns a response after handling the request, `A` is called a **client** and `B` is called a **server**. Therefore, you can host a service on your laptop and let it handle incoming requests, making it a server. Some friends of mine set up servers at their homes.

However, not everyone is rich enough to buy an extra computer to set up a server. Besides, if the power suddenly goes out, which often happens in some countries, your server can no longer provide services to clients. Therefore, I recommend renting a **cloud server** from a reliable cloud provider, such as AWS, GCP, or Azure. I'm currently using DigitalOcean, because I think its website is clean and easy to navigate. Another reason I would highly recommend using either GCP or DigitalOcean is that both develop their **CLI tools** using Go, a very fast programming language, while AWS and Azure use Python. You can feel a significant difference between using a Go CLI tool and a Python CLI tool in terms of performance.

On Digital Ocean, a **cloud instance** is called a **droplet**. The price of a default droplet (4GB RAM, 2 vCPUs, 80GB SSDs + 4TB transfer) is $24 per month, as of June 2026. I think the price is pretty reasonable, but I want it to be cheaper in the future.

If you have a background in computers, you should choose a **headless server**, which has no **graphical user interface (GUI)**, because you have definitely already learned many Linux commands at school. If you don't have a background in computers, I would still recommend choosing a headless server instead of a graphical one, since in the era of AI, you can effortlessly get a sequence of commands that fulfill your requirements using natural language.

### Access Server with SSH Key

After obtaining a cloud server, we now need to access it on our computers. I would assume that you chose a headless Linux server. If you didn't, you can leave now, because there will be tons of Linux commands in this documentation.

Now, open your terminal application on your computer, and make sure the `ssh` command is available on your system. The first command you need to learn is

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_digitalocean -C "james@snowy | DigitalOcean | 2026-06-23"
```

This will create an **SSH key pair**, which contains a **private key** and a **public key**, in the `.ssh` directory under your home directory. The option `-t ed25519` specifies the type of the SSH key pair, and `ed25519` is the best choice as of now. `-f` specifies the path to the private key file, while the public key file path is the same except with `.pub` appended. If not specified, the default private key file path is `~/.ssh/id_ed25519`, where `~` refers to the home directory on Linux. `-C` specifies a comment added to the public key, which doesn't affect the encryption. In this example, the comment string `james@snowy | DigitalOcean | 2026-06-23` complies with the [SSH Key Pair][snowy-ssh-key-pair-spec] spec.

It is recommended to use different SSH key pairs on different cloud providers for safety purposes, and that is why I created `id_ed25519_digitalocean` for my cloud server on DigitalOcean.

So, what do the private key and the public key do? Simply speaking, a message can be encrypted by a public key, and the ciphertext can only be decrypted by the corresponding private key. This allows messages to be transferred securely between two computers. Without it, your credential information risks being intercepted or tampered with by malicious hackers.

The private key, as implied by the name, should never be given to other people (not even your closest friends). On the contrary, it is safe to give your public key to others, including the cloud provider. However, you should still avoid giving it to unrelated people or making it publicly accessible on the internet.

Now, print the public key on the console using the `cat` command:

```bash
cat ~/.ssh/id_ed25519_digitalocean.pub
```

Copy the entire output string (including the comment), and paste it in a right place on the cloud provider's website. Because every platform has different ways to set up the SSH key, you better off checking the official documentation for more details. Usually, they will ask you to set a title or nickname, and just name it `<username>@<computer-name>`. For example, the name of my laptop is `twilight`, so the nickname I set was `james@twilight`.

After setting this up, we can try to access using the following command:

```bash
ssh -i ~/.ssh/id_ed25519_digitalocean root@<public-ip-address>
```

Here, `<public-ip-address>` is the public IP address of the cloud instance, which can be found in the cloud provider's website.

[snowy-ssh-key-pair-spec]: docs/spec/snowy_ssh_key_pair_spec.md
