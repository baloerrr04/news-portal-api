# Express.js RESTful API Study Jam Project

This project serves as a sample RESTful API built with Express.js, tailored for the Google Developer Group on Campus at Srivijaya State Polytechnic. It is specifically designed for the "Creating your RESTful API with Express.js" study jam.

## Overview

This API provides basic CRUD (Create, Read, Update, Delete) operations for managing todos. It's intended to be a hands-on learning resource for students to understand the fundamentals of building APIs with Express.js.

## Tech Stack

-   [Express.js](https://expressjs.com/): A fast, unopinionated, minimalist web framework for Node.js.
-   Node.js: JavaScript runtime environment.
-   Prisma ORM: Database ORM For Nodejs

## Setup

### Prerequisites

-   Node.js installed on your machine.

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/notilmi/gdgoc-studyjam-express-example
    cd gdgoc-studyjam-express-example
    ```

2.  Install the dependencies:

    ```bash
    npm install
    ```

3. Copy env:

    ```bash
    mv .env.example .env
    ```

4. Push Database schema to Database:

    ```bash
    npx prisma db push
    ```

### Running the API

To start the server, use the following command:

```bash
npm run start
```

### API Output Sample

- [Postman Collection](https://warped-station-385773.postman.co/workspace/Workspace-1~bc8e11b5-c67a-45c8-9eef-e943c6276114/collection/29725546-0d1a93f8-c7be-4ada-ba16-1fbe9bcecff1?action=share&creator=29725546)