# Figmawatcher POC

This is a very quick and dirty proof of concept to watch figma nodes and report out when they change. It uses:

- Prisma
- Apollo Server
- Figma API

## Running / Setup

Once you've pulled down the code run `yarn` to install deps, then use `npx prisma migrate dev` to create your database. This uses sqlite so the database will be created under `prisma/dev.db`. If yu're using vs code this sqlite plugin will come in handy. After setup run `yarn dev` to start the server.

### Creating users

With the way I set this up you need to register a user before you can call the API, so you'll need to enter one manually into the database. If you're using the SQLite explorer or some other sqlite editor that should be pretty straightforward. The insert statement will look something like

```sql
INSERT INTO User (name, figmaKey)
VALUES ("whatever", "yourfigmaapikey");
```

Pretty important caveat here: I'm not encrypting the API key so make sure you don't push your database up. I don't think there's a ton of damage you can do with someone elses figma api key since it's all read but probably best to not share them, or at least use a throwaway key for testing.

After you have a user you can head to `localhost:4000` and click the Query your Server button to go to the apollo sandbox. In order to query you'll need to enter your figma api key in the headers as `X-Figma-Token`.

To watch a figma node you'll need to create one with the `createFigmaNode` mutation. This needs a `file` and `nodeId` from figma and a user-defined name. You can find file and nodeId from the url of your figma file: `https://www.figma.com/file/cvpDzONjLd38jklADH2FuK/Figma-Watcher?node-id=0%3A1` In this example `cvpDzONjLd38jklADH2FuK` is the file and `0%3A11` is the nodeId. Once created a service runs every minute to watch each node for changes. You can also manually trigger a check with the `watchNode` mutation.