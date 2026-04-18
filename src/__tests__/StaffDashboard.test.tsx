import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import StaffDashboard from '../components/StaffDashboard/index';

// Mock the components and hooks to isolate StaffDashboard
jest.mock('../components/StaffDashboard/OccupancyTable', () => () => <div>Mock OccupancyTable</div>);
jest.mock('../components/StaffDashboard/BroadcastPanel', () => () => <div>Mock BroadcastPanel</div>);
jest.mock('../components/StaffDashboard/AIRoutingPanel', () => () => <div>Mock AIRoutingPanel</div>);
jest.mock('../components/StaffDashboard/EventTimeline', () => () => <div>Mock EventTimeline</div>);

jest.mock('../hooks/useOccupancy', () => ({
  useOccupancy: () => ({ sections: [], totalAttendance: 0, averageOccupancyPct: 0 }),
}));

jest.mock('../hooks/useRemoteConfig', () => ({
  useRemoteConfig: () => ({ halftimeMode: false, exitRoutingActive: false }),
}));

describe('StaffDashboard Component', () => {
  it('renders without crashing and displays the default panel', () => {
    render(<StaffDashboard />);

    expect(screen.getByText('StadiumSense')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    // Default active panel is OccupancyTable
    expect(screen.getByText('Mock OccupancyTable')).toBeInTheDocument();
  });
});
