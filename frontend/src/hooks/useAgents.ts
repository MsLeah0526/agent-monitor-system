// Agent数据Hook
import { useState, useEffect } from 'react';
import { agentApi } from '../services/api';
import { wsService } from '../services/websocket';
import { Agent, TeamOverview } from '../types/agent';

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();

    // WebSocket实时更新
    wsService.on('agent-update', (message) => {
      if (message.type === 'agent-update') {
        setAgents((prev) => {
          const index = prev.findIndex((a) => a.id === message.data.id);
          if (index > -1) {
            const newAgents = [...prev];
            newAgents[index] = { ...newAgents[index], ...message.data };
            return newAgents;
          }
          return [...prev, message.data];
        });
      }
    });

    wsService.on('score-change', (message) => {
      if (message.type === 'score-change') {
        setAgents((prev) =>
          prev.map((agent) =>
            agent.id === message.data.agentId
              ? { ...agent, score: message.data.newScore }
              : agent
          )
        );
      }
    });

    return () => {
      wsService.off('agent-update', () => {});
      wsService.off('score-change', () => {});
    };
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await agentApi.getAllAgents();
      setAgents(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch agents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { agents, loading, error, refetch: fetchAgents };
};

export const useTeamOverview = () => {
  const [overview, setOverview] = useState<TeamOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();

    wsService.on('team-overview', (message) => {
      if (message.type === 'team-overview') {
        setOverview(message.data);
      }
    });

    return () => {
      wsService.off('team-overview', () => {});
    };
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const data = await agentApi.getTeamOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed to fetch team overview:', err);
    } finally {
      setLoading(false);
    }
  };

  return { overview, loading, refetch: fetchOverview };
};
