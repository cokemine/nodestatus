import { resolveEvent, createNewEvent } from '../controller/status';
import type NodeStatus from '../lib/core';

export default function useEvent(instance: NodeStatus) {
  instance.onServerConnected(async (socket, username) => resolveEvent(username));

  instance.onServerFinish(async (socket, username) => createNewEvent(username));
}
