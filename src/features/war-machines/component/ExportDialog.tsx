import { Button, Dialog, Form } from '@zougui/react.ui'

import { useAppForm } from '~/hooks';

import { formSchema } from './ImportDialog';
import { warMachineStore } from '../warMachine.store';
import { useSelector } from '@xstate/store/react';

export const ExportDialog = ({ children }: ExportDialogProps) => {
  const state = useSelector(warMachineStore, state => state.context.current);

  const form = useAppForm({
    schema: formSchema,
    defaultValues: {
      warMachines: JSON.stringify({
        leagueBonus: state.leagueBonus ?? 0,
        warMachines: state.warMachines,
      }) as never,
      heroes: JSON.stringify(state.crewHeroes) as never,
      artifactTypes: JSON.stringify(state.artifactTypes) as never,
    },
  });

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>

      <Dialog.Content>
        <Form.Root {...form}>
          <Dialog.Header>
            <Dialog.Title>Export data</Dialog.Title>
            <Dialog.Description>Export data as JSON</Dialog.Description>
          </Dialog.Header>

          <Dialog.Body className="space-y-4">
            <Form.Textarea
              control={form.control}
              name="warMachines"
              label="War Machines"
            />

            <Form.Textarea
              control={form.control}
              name="heroes"
              label="Heroes"
            />

            <Form.Textarea
              control={form.control}
              name="artifactTypes"
              label="Artifacts"
            />
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="outline">Close</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Form.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export interface ExportDialogProps {
  children: React.ReactNode;
}
