import { Infrastructure, Team, GameState } from '../types/gameTypes';
import { generateId } from '../utils/idGenerator';

interface UpgradeOption {
  id: string;
  name: string;
  description: string;
  cost: number;
  timeToComplete: number; // in days
  effect: Partial<Infrastructure>;
}

interface MaintenanceReport {
  facility: string;
  condition: number;
  maintenanceCost: number;
  urgentRepairsNeeded: boolean;
  recommendations: string[];
}

export const calculateInfrastructureImpact = (infrastructure: Infrastructure): {
  revenueMultiplier: number;
  trainingEffectiveness: number;
  youthDevelopment: number;
  injuryRecovery: number;
  fanHappiness: number;
} => {
  const stadiumScore = calculateStadiumScore(infrastructure.stadium);
  const trainingScore = calculateTrainingScore(infrastructure.trainingFacilities);
  const youthScore = calculateYouthScore(infrastructure.youthAcademy);
  const medicalScore = calculateMedicalScore(infrastructure.medicalCenter);

  return {
    revenueMultiplier: 1 + (stadiumScore / 200), // 0.5 to 1.5
    trainingEffectiveness: 1 + (trainingScore / 150), // 0.67 to 1.67
    youthDevelopment: 1 + (youthScore / 150), // 0.67 to 1.67
    injuryRecovery: 1 + (medicalScore / 200), // 0.5 to 1.5
    fanHappiness: stadiumScore / 100 // 0 to 1
  };
};

const calculateStadiumScore = (stadium: Infrastructure['stadium']): number => {
  const facilityScore = Object.values(stadium.facilities).reduce((sum, value) => sum + value, 0) / 5;
  return (
    (stadium.condition / 100) * 
    (facilityScore + stadium.capacity / 1000) / 2
  );
};

const calculateTrainingScore = (facilities: Infrastructure['trainingFacilities']): number => {
  const specializationBonus = facilities.specializations.reduce((sum, spec) => sum + spec.effect, 0);
  return (facilities.level * 10 + specializationBonus) * (facilities.condition / 100);
};

const calculateYouthScore = (academy: Infrastructure['youthAcademy']): number => {
  return (
    (academy.level * 20 + 
    academy.facilities + 
    academy.coaching + 
    academy.recruitment) / 4
  );
};

const calculateMedicalScore = (center: Infrastructure['medicalCenter']): number => {
  return (
    (center.level * 15 + 
    center.equipment + 
    center.staff + 
    center.rehabilitationQuality) / 4
  );
};

export const generateUpgradeOptions = (team: Team): UpgradeOption[] => {
  const options: UpgradeOption[] = [];
  const { infrastructure } = team;

  // Stadium upgrades
  if (infrastructure.stadium.expansionPossible) {
    options.push({
      id: generateId('upgrade_'),
      name: 'Stadium Expansion',
      description: 'Increase stadium capacity by 5,000 seats',
      cost: 5000000,
      timeToComplete: 180,
      effect: {
        stadium: {
          ...infrastructure.stadium,
          capacity: infrastructure.stadium.capacity + 5000
        }
      }
    });
  }

  // Training facilities upgrades
  if (infrastructure.trainingFacilities.level < 5) {
    options.push({
      id: generateId('upgrade_'),
      name: 'Training Facilities Improvement',
      description: 'Upgrade training facilities to the next level',
      cost: 2000000 * (infrastructure.trainingFacilities.level + 1),
      timeToComplete: 90,
      effect: {
        trainingFacilities: {
          ...infrastructure.trainingFacilities,
          level: infrastructure.trainingFacilities.level + 1
        }
      }
    });
  }

  // Youth academy upgrades
  if (infrastructure.youthAcademy.level < 5) {
    options.push({
      id: generateId('upgrade_'),
      name: 'Youth Academy Enhancement',
      description: 'Improve youth academy facilities and recruitment',
      cost: 1500000 * (infrastructure.youthAcademy.level + 1),
      timeToComplete: 120,
      effect: {
        youthAcademy: {
          ...infrastructure.youthAcademy,
          level: infrastructure.youthAcademy.level + 1,
          facilities: Math.min(100, infrastructure.youthAcademy.facilities + 10)
        }
      }
    });
  }

  return options;
};

export const processInfrastructureMaintenance = (infrastructure: Infrastructure): MaintenanceReport[] => {
  const reports: MaintenanceReport[] = [];

  // Stadium maintenance
  reports.push({
    facility: 'Stadium',
    condition: infrastructure.stadium.condition,
    maintenanceCost: calculateStadiumMaintenance(infrastructure.stadium),
    urgentRepairsNeeded: infrastructure.stadium.condition < 60,
    recommendations: generateStadiumRecommendations(infrastructure.stadium)
  });

  // Training facilities maintenance
  reports.push({
    facility: 'Training Facilities',
    condition: infrastructure.trainingFacilities.condition,
    maintenanceCost: infrastructure.trainingFacilities.maintenanceCost,
    urgentRepairsNeeded: infrastructure.trainingFacilities.condition < 70,
    recommendations: generateTrainingRecommendations(infrastructure.trainingFacilities)
  });

  return reports;
};

const calculateStadiumMaintenance = (stadium: Infrastructure['stadium']): number => {
  const baseRate = 1000; // Base maintenance cost per 1000 capacity
  const capacityCost = (stadium.capacity / 1000) * baseRate;
  const facilitiesFactor = Object.values(stadium.facilities).reduce((sum, value) => sum + value, 0) / 500;
  
  return Math.round(capacityCost * (1 + facilitiesFactor));
};

const generateStadiumRecommendations = (stadium: Infrastructure['stadium']): string[] => {
  const recommendations: string[] = [];

  if (stadium.condition < 60) {
    recommendations.push('Urgent repairs needed to prevent safety issues');
  }

  if (stadium.facilities.seatingQuality < 60) {
    recommendations.push('Consider upgrading seating facilities');
  }

  if (stadium.facilities.hospitality < 50) {
    recommendations.push('Hospitality facilities need improvement');
  }

  return recommendations;
};

const generateTrainingRecommendations = (facilities: Infrastructure['trainingFacilities']): string[] => {
  const recommendations: string[] = [];

  if (facilities.condition < 70) {
    recommendations.push('Maintenance required for optimal training effectiveness');
  }

  if (facilities.level < 3) {
    recommendations.push('Consider upgrading facilities to improve training quality');
  }

  return recommendations;
};