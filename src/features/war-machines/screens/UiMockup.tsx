import React, { useState } from "react";

import { Table, Input, Button } from '@zougui/react.ui';

import { Progress } from '~/components/Progress';
import { Avatar } from '~/components/Avatar';
import { Card, CardContent } from '~/components/Card';
import { warMachineStore } from '../warMachine.store';

export const UiMockup = () => {
  const { context } = warMachineStore.getSnapshot();

  const [warMachines, setWarMachines] = useState(context.current.warMachines);
  const [heroes, setHeroes] = useState(context.current.crewHeroes);
  const [artifacts, setArtifacts] = useState(context.current.artifactTypes);
  const [targetStar, setTargetStar] = useState(context.target.starLevel);
  const [upgradeRequirements, setUpgradeRequirements] = useState(context.target.warMachines);

  // Function to update state for editable tables
  const updateTable = (setState, index, key, value) => {
    setState(prev => {
      const newState = [...prev];
      newState[index][key] = value;
      return newState;
    });
  };

  // Mock function to calculate best results & upgrade requirements
  const calculateBestResults = () => {
    // Logic to determine best war machine formations and crews
  };

  const calculateUpgrades = () => {
    // Logic to determine required levels and upgrades for target star
  };

  return (
    <div className="p-6 space-y-6">
      {/* War Machines Table */}
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">War Machines</h2>
          <Table.Root>
            {/* Table Headers */}
            <thead>
              <tr>
                <th>Name</th>
                <th>Level</th>
                <th>Sacred Card Level</th>
                <th>Damage</th>
                <th>Health</th>
                <th>Armor</th>
                <th>Rarity</th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody>
              {Object.values(warMachines).map((machine, index) => (
                <tr key={index}>
                  {Object.keys(machine).map((key) => (
                    <td key={key}>
                      <Input
                        value={String(machine[key])}
                        onChange={(e) => updateTable(setWarMachines, index, key, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table.Root>
        </CardContent>
      </Card>

      {/* Heroes Table */}
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Heroes</h2>
          <Table.Root>
            <thead>
              <tr>
                <th>Name</th>
                <th>Damage</th>
                <th>Health</th>
                <th>Armor</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(heroes).map((hero, index) => (
                <tr key={index}>
                  {Object.keys(hero).map((key) => (
                    <td key={key}>
                      <Input
                        value={String(hero[key])}
                        onChange={(e) => updateTable(setHeroes, index, key, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table.Root>
        </CardContent>
      </Card>

      {/* Artifact Types Table */}
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Artifact Types</h2>
          <Table.Root>
            <thead>
              <tr>
                <th>Type</th>
                {[30, 35, 40, 45, 50, 55, 60, 65].map((value) => (
                  <th key={value}>{value}%</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(artifacts).map((artifact, index) => (
                <tr key={index}>
                  <td>{artifact.name}</td>
                  {Object.values(artifact.percents).map((val, i) => (
                    <td key={i}>
                      <Input
                        value={val}
                        onChange={(e) => updateTable(setArtifacts, index, `values[${i}]`, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table.Root>
        </CardContent>
      </Card>

      {/* Likely Best Results Section */}
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Likely Best Results</h2>
          <div className="grid grid-cols-3 gap-4">
            {Object.values(warMachines).slice(0, 3).map((machine, index) => (
              <div key={index} className="flex flex-col items-center">
                <img className="w-16 h-16" src={`/war-machines/${machine.name}.webp`} alt={machine.name} />
                <span>{machine.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Target Star Input & Upgrade Table */}
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Target Star Calculation</h2>
          <Input
            type="number"
            placeholder="Enter target star"
            value={targetStar}
            onChange={(e) => setTargetStar(Number(e.target.value))}
          />
          <Button onClick={calculateUpgrades} className="mt-2">Calculate</Button>
        </CardContent>
      </Card>
    </div>
  );
};
