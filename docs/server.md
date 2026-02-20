## Server

To build a personal website, we first need a **server**, on which we can deploy our web applications. A server is a computer that handles requests from other computers in a network. On the internet, every computer has a public IP address, allowing them to communicate with one another. When computer `A` sends a request to computer `B`, and `B` returns a response aftering handling the request, `A` is called a **client** and `B` is called a server. Therefore, you can host a service on your laptop and let it handle incoming requests, making it a server. Some friends of mine set up servers at their home.

However, not every one is rich enough to have an extra computer, and if the power suddenly goes out for many reasons, your server can no longer provide services to clients. So, I recommend renting a **cloud server** on reliable cloud providers, such as AWS, GCP, and Azure. I am currently using Digital Ocean, because I think its website is cleaner and easier to navigate. Another reason I would highly recommend you using either GCP or DigitalOcean is, both cloud providers use Go language to develop their CLI tools, while AWS and Azure use Python. You will feel significant differences between using a Go CLI tool and a Python CLI tool in terms of performance.

On Digital Ocean, a cloud server is called a **droplet**. The price of a default droplet (4GB RAM + 2 CPUs + 80GB SSDs + 4TB transfer) is \$28/mo, as of February 2026. I think the price is pretty cool, but I want it to be cheaper in the future.

If you have a background in computers, you should choose a headless server (no GUI), because you definitely have already learned many Linux commands at school. If you don't have a background in computers, I would still recommend you choosing a headless server (no GUI) instead of a graphical server. Because in the era of AI, you can get a sequence of commands that fulfill your requirements using natural language effortlessly. I will be more specific in the [CLI tools](./cli_tools.md) section.

### Access Server with SSH Key

After getting a cloud server, we now need to access it on our computers. I would assume that you chose a headless Linux server. If you didn't, you can leave now, because there will be tons of Linux commands in this repo.

Now, open your terminal application on your computer, and make sure the `ssh` command is available on your system. The first command you need to learn is

```
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_digital_ocean -C "james@snowy | digital ocean | 2026-02"
```

This will create an **SSH key pair**, which contains a **private key** and a **public key**, in the `.ssh` folder under your home directory. The option `-t ed25519` specifies the type of the SSH key pair, and `ed25519` is the best up to now. `-f` specifies the path to the private key file, while the public key file path is the same except appending `.pub`. If not specified, the default private key file path is `~/.ssh/id_ed25519`, where `~` refers to the home directory on Linux. `-C` specified a comment added to the public key, which doesn't affect the encryption. In this example, the comment string `james@snowy | digital ocean | 2026-02` includes:

- `james` - my username on the server
- `snowy` - the server name
- `digital ocean` - the cloud platform that it is used for
- `2026-02` - the month that I create this SSH key pair

It is recommended to use different SSH key pairs on different cloud platforms for safety purposes, and that is why I created `id_ed25519_digital_ocean` for my cloud server on Digital Ocean.

So, what do the private key and the public key do? Simply speaking, a message can be encrypted by a private key, and the ciphertext can only be decrypted by the corresponding public key, and vice versa. This allows securely transferring information between two computers. Without it, your credential information risks being intercepted or tampered with by evil hackers.

The private key, as implied the name, should never be given to other people (not even trusted friends). On the contrary, it is safe to give your public key to others, including the cloud providers. However, you should still avoid giving it to unrelated people or make it publicly accessible online.

Now, print the public key on the console using the `cat` command:

```bash
cat ~/.ssh/id_ed25519_digital_ocean
```

Copy the entire string (including the comment), and paste it in a right place on the cloud provider webpage. Because every platform has different ways to set up the SSH key, you better off checking the official documentation for more details. Usually, they will ask you to set a title or nickname, and just name it `<username>@<computer-name>`. For example, the name of my laptop is "Twilight", so the nickname I set was `james@twilight`.

After setting this up, we can try to access using the following command:

```bash
ssh -i ~/.ssh/id_ed25519_digital_ocean root@<server-ip-address>
```

Here, `<server-ip-address>` can be found in the cloud provider webpage.

### Create a User
