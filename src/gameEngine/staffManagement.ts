import { Staff, StaffRole, StaffAttributes, Team, Player, GameState } from '../types/gameTypes';
import { generateId } from '../utils/idGenerator';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';

interface StaffImpact {
  playerDevelopment: number;
  teamPerformance: number;
  youthDevelopment: number;
  injuryRecovery: number;
  scoutingEfficiency: number;
}

export const calculateStaffImpact = (staff: Staff[], team: Team): StaffImpact => {
  const impact: StaffImpact = {
    playerDevelopment: 1.0,
    teamPerformance: 1.0,
    youthDevelopment: 1.0,
    injuryRecovery: 1.0,
    scoutingEfficiency: 1.0
  };

  staff.forEach(member => {
    if (member.contract.clubId !== team.id) return;

    switch (member.role) {
      case StaffRole.Coach:
        impact.playerDevelopment *= 1 + (member.attributes.coaching / 200);
        impact.teamPerformance *= 1 + (member.attributes.tacticalKnowledge / 200);
        break;
      case StaffRole.YouthCoach:
        impact.youthDevelopment *= 1 + (member.attributes.youthDevelopment / 150);
        break;
      case StaffRole.PhysioTherapist:
        impact.injuryRecovery *= 1 + (member.attributes.medical / 150);
        break;
      case StaffRole.Scout:
        impact.scoutingEfficiency *= 1 + (member.attributes.scouting / 150);
        break;
      case StaffRole.DataAnalyst:
        impact.teamPerformance *= 1 + (member.attributes.dataAnalysis / 300);
        impact.scoutingEfficiency *= 1 + (member.attributes.dataAnalysis / 300);
        break;
    }
  });

  // Normalize impacts to reasonable ranges
  Object.keys(impact).forEach(key => {
    const k = key as keyof StaffImpact;
    impact[k] = Math.max(0.5, Math.min(2.0, impact[k]));
  });

  return impact;
};

export const createStaffMember = (role: StaffRole, quality: number = 50): Staff => {
  const attributes = generateStaffAttributes(role, quality);
  
  return {
    id: generateId('staff_'),
    name: faker.person.fullName(),
    age: Math.floor(Math.random() * 30) + 30,
    nationality: faker.location.country(),
    role,
    attributes,
    contract: {
      clubId: null,
      wage: calculateStaffWage(role, attributes),
      expiryDate: dayjs().add(2, 'year').toISOString()
    },
    reputation: calculateReputation(attributes),
    personality: {
      ambition: Math.floor(Math.random() * 20),
      professionalism: Math.floor(Math.random() * 20),
      loyalty: Math.floor(Math.random() * 20),
      determination: Math.floor(Math.random() * 20)
    },
    specialization: generateSpecializations(role),
    relationships: {
      players: new Map(),
      fellowStaff: new Map()
    },
    className: 'Staff'
  };
};

const generateStaffAttributes = (role: StaffRole, quality: number): StaffAttributes => {
  const baseValue = quality;
  const variation = 20;

  const generateAttribute = () => {
    return Math.max(1, Math.min(100, 
      baseValue + (Math.random() * variation) - (variation / 2)
    ));
  };

  const attributes: StaffAttributes = {
    coaching: generateAttribute(),
    tacticalKnowledge: generateAttribute(),
    manManagement: generateAttribute(),
    discipline: generateAttribute(),
    motivation: generateAttribute(),
    fitness: generateAttribute(),
    medical: generateAttribute(),
    scouting: generateAttribute(),
    youthDevelopment: generateAttribute(),
    dataAnalysis: generateAttribute()
  };

  // Boost primary attributes based on role
  switch (role) {
    case StaffRole.Coach:
      attributes.coaching *= 1.2;
      attributes.tacticalKnowledge *= 1.1;
      break;
    case StaffRole.Scout:
      attributes.scouting *= 1.3;
      break;
    case StaffRole.PhysioTherapist:
      attributes.medical *= 1.3;
      attributes.fitness *= 1.2;
      break;
    case StaffRole.YouthCoach:
      attributes.youthDevelopment *= 1.3;
      attributes.coaching *= 1.1;
      break;
    case StaffRole.DataAnalyst:
      attributes.dataAnalysis *= 1.3;
      attributes.tacticalKnowledge *= 1.1;
      break;
  }

  // Normalize all attributes to 1-100 range
  Object.keys(attributes).forEach(key => {
    const k = key as keyof StaffAttributes;
    attributes[k] = Math.max(1, Math.min(100, Math.round(attributes[k])));
  });

  return attributes;
};

const calculateStaffWage = (role: StaffRole, attributes: StaffAttributes): number => {
  const baseWage = {
    [StaffRole.Manager]: 10000,
    [StaffRole.AssistantManager]: 5000,
    [StaffRole.Coach]: 3000,
    [StaffRole.Scout]: 2000,
    [StaffRole.PhysioTherapist]: 2500,
    [StaffRole.DataAnalyst]: 2500,
    [StaffRole.YouthCoach]: 2000
  }[role] || 2000;

  const attributeAverage = Object.values(attributes).reduce((a, b) => a + b, 0) / Object.values(attributes).length;
  const qualityMultiplier = 0.5 + (attributeAverage / 100);

  return Math.round(baseWage * qualityMultiplier);
};

const calculateReputation = (attributes: StaffAttributes): number => {
  const attributeSum = Object.values(attributes).reduce((a, b) => a + b, 0);
  return Math.round((attributeSum / Object.values(attributes).length) * 1.2);
};

const generateSpecializations = (role: StaffRole): string[] => {
  const specializations: Record<StaffRole, string[]> = {
    [StaffRole.Coach]: ['Technical Training', 'Tactical Training', 'Physical Training', 'Mental Training'],
    [StaffRole.Scout]: ['Youth Scouting', 'Technical Scouting', 'Tactical Analysis'],
    [StaffRole.PhysioTherapist]: ['Injury Prevention', 'Rehabilitation', 'Performance Analysis'],
    [StaffRole.YouthCoach]: ['Youth Development', 'Technical Training', 'Mental Development'],
    [StaffRole.DataAnalyst]: ['Performance Analysis', 'Opposition Analysis', 'Recruitment Analysis'],
    [StaffRole.Manager]: [],
    [StaffRole.AssistantManager]: []
  };

  const available = specializations[role] || [];
  if (available.length === 0) return [];

  const count = Math.floor(Math.random() * 2) + 1;
  const selected = new Set<string>();

  while (selected.size < count && selected.size < available.length) {
    const index = Math.floor(Math.random() * available.length);
    selected.add(available[index]);
  }

  return Array.from(selected);
};

export const updateStaffRelationships = (gameState: GameState): Staff[] => {
  return gameState.staff.map(staffMember => {
    if (!staffMember.contract.clubId) return staffMember;

    const team = gameState.teams.find(t => t.id === staffMember.contract.clubId);
    if (!team) return staffMember;

    // Update relationships with players
    const playerRelationships = new Map<string, number>();
    team.playerIds.forEach(playerId => {
      const existingRelationship = staffMember.relationships.players.get(playerId) || 50;
      const change = Math.random() * 4 - 2; // -2 to +2
      playerRelationships.set(playerId, Math.max(0, Math.min(100, existingRelationship + change)));
    });

    // Update relationships with fellow staff
    const staffRelationships = new Map<string, number>();
    team.staffIds.forEach(fellowStaffId => {
      if (fellowStaffId === staffMember.id) return;
      const existingRelationship = staffMember.relationships.fellowStaff.get(fellowStaffId) || 50;
      const change = Math.random() * 4 - 2; // -2 to +2
      staffRelationships.set(fellowStaffId, Math.max(0, Math.min(100, existingRelationship + change)));
    });

    return {
      ...staffMember,
      relationships: {
        players: playerRelationships,
        fellowStaff: staffRelationships
      }
    };
  });
};