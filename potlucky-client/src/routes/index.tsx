import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Container,
  Paper,
  TextInput,
  Button,
  Stack,
  Text,
  Textarea,
  Group,
  NumberInput,
  Accordion,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { formOptions, useForm } from "@tanstack/react-form";
import { IconCalendar, IconSignature, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import type { PotluckFormEntry } from "@/types/types";
import { Category } from "@/types/types";

export const Route = createFileRoute("/")({
  component: MainPage,
});

const INFORMATION_MAX_LENGTH = 512;

const defaultPotluckFormEntry: PotluckFormEntry = {
  name: "",
  datetime: null,
  information: "",
  requirements: {},
};

const formSchema = z.object({
  name: z
    .string()
    .min(4, "Event name must have at least 4 characters")
    .max(128, "Event name must be at most 64 characters"),
  datetime: z
    .date()
    .refine((val) => val && val > new Date(), "Event must be in the future"),
  information: z
    .string()
    .max(
      INFORMATION_MAX_LENGTH,
      `Information must be at most ${INFORMATION_MAX_LENGTH} characters`,
    ),
  requirements: z.partialRecord(z.enum(Category), z.number()),
});

const formOpts = formOptions({
  defaultValues: defaultPotluckFormEntry,
  validators: {
    onMount: formSchema,
    onChange: formSchema,
  },
});

function MainPage() {
  const navigate = useNavigate();

  // const [isFocused, setIsFocused] = useState({
  //   'name': false,
  //   'datetime': false,
  //   'information': false
  // })

  const mutation = useMutation({
    mutationFn: async (values: PotluckFormEntry) => {
      try {
        const payload = {
          name: values.name,
          datetime: values.datetime ? dayjs(values.datetime).toISOString() : "",
          information: values.information,
          requirements: values.requirements,
        };

        console.log(payload);
        const response = await fetch(
          `${import.meta.env.VITE_POTLUCKY_API_URL}/potluck`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to create potluck");
        }

        return response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      navigate({
        to: "/pl/$plid",
        params: {
          plid: data.potluckId,
        },
      });
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message:
          "Something went wrong while creating your potluck. Please try again.",
        color: "red",
        icon: <IconX />,
        position: "top-center",
        autoClose: 10000,
      });
    },
  });

  const form = useForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      mutation.mutateAsync(value);
    },
  });

  return (
    <Container
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper w={{ base: "100%", xs: "380px" }}>
        <header>
          <Text size="lg" ta="left" mb="lg" fw="bold" mr="xl">
            Start planning your potluck!
          </Text>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <Stack>
            <form.Field
              name="name"
              children={(field) => {
                return (
                  <TextInput
                    required
                    label="Event Name"
                    placeholder={
                      field.state.meta.isTouched
                        ? undefined
                        : `e.g. Board Game Night`
                    }
                    leftSection={<IconSignature size={18} />}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={mutation.isPending}
                    error={
                      field.state.meta.isBlurred &&
                      field.state.meta.errors.length > 0
                        ? field.state.meta.errors[0]?.message
                        : null
                    }
                  />
                );
              }}
            />

            <form.Field
              name="datetime"
              children={(field) => {
                return (
                  <DateTimePicker
                    dropdownType="modal"
                    label="Date & Time"
                    required
                    leftSection={<IconCalendar size={18} />}
                    valueFormat="MM/DD/YYYY HH:mm A"
                    timePickerProps={{
                      withDropdown: true,
                      popoverProps: { withinPortal: false },
                      format: "12h",
                    }}
                    value={field.state.value}
                    disabled={mutation.isPending}
                    onBlur={() => {
                      field.handleBlur();
                    }}
                    onChange={(date) => {
                      field.handleChange(new Date(date!));
                    }}
                    error={
                      field.state.meta.isBlurred &&
                      field.state.meta.errors.length > 0
                        ? field.state.meta.errors[0]?.message
                        : null
                    }
                  />
                );
              }}
            />

            <form.Field
              name="information"
              children={(field) => {
                return (
                  <Textarea
                    autosize
                    minRows={2}
                    maxRows={4}
                    label="Information"
                    placeholder={
                      field.state.meta.isTouched
                        ? undefined
                        : "Add any additional information here like an address, dish requirements, etc."
                    }
                    value={field.state.value}
                    disabled={mutation.isPending}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={
                      field.state.meta.isBlurred &&
                      field.state.meta.errors.length > 0
                        ? field.state.meta.errors[0]?.message
                        : null
                    }
                  />
                );
              }}
            />

            <Accordion variant="contained">
              <Accordion.Item value="requirements">
                <Accordion.Control>
                  <Text size="sm" fw={500}>
                    Dish Requirements (Optional)
                  </Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="sm">
                    <Text size="xs" c="dimmed">
                      Specify how many dishes you'd prefer at the potluck for
                      each category.
                    </Text>

                    <form.Field
                      name="requirements"
                      children={(field) => {
                        const updateRequirement = (
                          category: Category,
                          value: number,
                        ) => {
                          field.handleChange({
                            ...field.state.value,
                            [category]: value,
                          });
                          if (value == 0) {
                            delete field.state.value[category];
                          }
                        };

                        return (
                          <Stack gap="xs">
                            <NumberInput
                              label="🍖 Mains"
                              placeholder="0"
                              min={0}
                              value={field.state.value[Category.Main] || 0}
                              onChange={(val) =>
                                updateRequirement(Category.Main, Number(val))
                              }
                              disabled={mutation.isPending}
                            />
                            <NumberInput
                              label="🍚 Sides"
                              placeholder="0"
                              min={0}
                              value={field.state.value[Category.Side] || 0}
                              onChange={(val) =>
                                updateRequirement(Category.Side, Number(val))
                              }
                              disabled={mutation.isPending}
                            />
                            <NumberInput
                              label="🍰 Desserts"
                              placeholder="0"
                              min={0}
                              value={field.state.value[Category.Dessert] || 0}
                              onChange={(val) =>
                                updateRequirement(Category.Dessert, Number(val))
                              }
                              disabled={mutation.isPending}
                            />
                            <NumberInput
                              label="🥤 Drinks"
                              placeholder="0"
                              min={0}
                              value={field.state.value[Category.Drinks] || 0}
                              onChange={(val) =>
                                updateRequirement(Category.Drinks, Number(val))
                              }
                              disabled={mutation.isPending}
                            />
                            <NumberInput
                              label="🍽️ Other"
                              placeholder="0"
                              min={0}
                              value={field.state.value[Category.Other] || 0}
                              onChange={(val) =>
                                updateRequirement(Category.Other, Number(val))
                              }
                              disabled={mutation.isPending}
                            />
                          </Stack>
                        );
                      }}
                    />
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isPristine]}
            >
              {([canSubmit, isPristine]) => (
                <Group justify="flex-end" mt="md">
                  <Button
                    type="submit"
                    size="sm"
                    fullWidth
                    loading={mutation.isPending}
                    disabled={!canSubmit || isPristine || mutation.isPending}
                  >
                    Create
                  </Button>
                </Group>
              )}
            </form.Subscribe>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
