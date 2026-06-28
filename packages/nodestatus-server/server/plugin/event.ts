import type NodeStatus from '../lib/core';
import { createNewEvent, resolveEvent } from '../controller/status';

export default function useEvent(instance: NodeStatus) {
  instance.onServerConnected(async (socket, username) => resolveEvent(username));

  instance.onServerFinish(async (socket, username) => createNewEvent(username));
}
