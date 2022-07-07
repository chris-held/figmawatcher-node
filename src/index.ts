import { ApolloServer, gql } from "apollo-server";
import cron from "node-cron";

import { PrismaClient, User } from "@prisma/client";

import fetch from "node-fetch";

const prisma = new PrismaClient();

const schema = gql`
  type FigmaNode {
    id: String!
    name: String!
    file: String!
    nodeId: String!
    lastRun: String!
    lastUpdated: String
  }

  type User {
    id: String!
    name: String!
    nodes: [FigmaNode]
  }

  input CreateUserInput {
    name: String!
    apiKey: String!
  }

  input CreateFigmaNodeInput {
    name: String!
    file: String!
    nodeId: String!
  }

  enum FigmaNodeStatus {
    UPDATED
    NOT_UPDATED
  }

  type FigmaNodeStatusResult {
    figmaNode: FigmaNode!
    status: FigmaNodeStatus!
  }

  type Query {
    me: User!
  }

  type Mutation {
    createUser(user: CreateUserInput!): User!
    createFigmaNode(node: CreateFigmaNodeInput!): FigmaNode!
    nodeStatus(id: Int!): FigmaNode!
  }
`;

type CreateFigmaNodeInput = {
  name: string;
  file: string;
  nodeId: string;
};

const watchNode = async (id: number, token: string) => {
  const node = await prisma.figmaNode.findFirstOrThrow({ where: { id } });
  const res = await fetch(
    `https://api.figma.com/v1/files/${node.file}/nodes?ids=${node.nodeId}`,
    {
      headers: { "X-Figma-Token": token },
    }
  );
  if (res.ok) {
    const body = (await res.json()) as { nodes: any[] };

    // this is the original value of the nodes object. If the figma file
    // were to change this would not match when compared, so we know there was
    // a change made
    const old = node.figmaNodeHash;
    const compare = old === JSON.stringify(body.nodes);
    console.log(
      compare
        ? `Figma node ${node.id} hasn't changed`
        : `This Figma node (${node.id}) changed!`
    );
    const updated = {
      ...node,
      lastRun: new Date(),
    };
    if (!compare) {
      updated.figmaNodeHash = JSON.stringify(body.nodes);
      updated.lastUpdated = new Date();
    }

    return prisma.figmaNode.update({ data: updated, where: { id } });
  }
  console.log(res);
  throw new Error("Figma call failed");
};

const getUser = async (figmaKey: string) => {
  return prisma.user.findFirstOrThrow({
    where: { figmaKey },
    include: { nodes: true },
  });
};

cron.schedule("* * * * *", async () => {
  console.log("watching nodes");
  const nodes = await prisma.figmaNode.findMany({ include: { user: true } });
  console.log(`checking ${nodes.length} nodes`);
  Promise.all(nodes.map((n) => watchNode(n.id, n.user.figmaKey)));
});

const resolvers = {
  Query: {
    me: (_parent: never, _args: never, { user }: { user: User }) => {
      return user;
    },
  },
  Mutation: {
    createFigmaNode: async (
      _parent: never,
      { node }: { node: CreateFigmaNodeInput },
      { user, token }: { user: User; token: string }
    ) => {
      const created = await prisma.figmaNode.create({
        data: {
          ...node,
          userId: user.id,
          figmaNodeHash: "",
          lastRun: new Date(),
        },
      });

      return watchNode(created.id, token);
    },
    nodeStatus: async (
      _parent: never,
      { id }: { id: number },
      { token }: { token: string }
    ) => {
      return watchNode(id, token);
    },
  },
};

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  csrfPrevention: true,
  cache: "bounded",
  context: async ({ req }) => {
    const token = req.headers["x-figma-token"];
    if (!token) {
      throw new Error("X-Figma-Token is required");
    }
    const user = await getUser(token as string);
    return {
      user,
      token,
    };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
