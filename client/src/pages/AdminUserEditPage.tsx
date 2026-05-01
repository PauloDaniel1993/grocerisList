import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as api from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";

const editSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  role: z.enum(["user", "admin"]),
});

type EditForm = z.infer<typeof editSchema>;

function LoadingShell() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-24" />
      <Card className="max-w-xl">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminUserEditPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [originalName, setOriginalName] = useState("");

  const form = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: "", role: "user" },
  });

  useEffect(() => {
    if (!userId) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const u = await api.getAdminUser(userId);
        if (!cancelled) {
          form.reset({ name: u.name, role: u.role });
          setOriginalName(u.name);
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(
            e instanceof Error ? e.message : "Could not load this user"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, form]);

  if (loading) {
    return <LoadingShell />;
  }

  const submitting = form.formState.isSubmitting;

  async function onSubmit(values: EditForm) {
    if (!userId) {
      return;
    }
    try {
      await api.patchAdminUser(userId, {
        name: values.name.trim(),
        role: values.role,
      });
      toast.success("User updated");
      navigate("/admin/users");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    }
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/admin/users">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Users
        </Link>
      </Button>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Edit user</CardTitle>
          <CardDescription>
            {originalName ? `Editing ${originalName}` : "Update user details"}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        autoComplete="name"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Role</FormLabel>
                    <FormDescription>
                      Admins can manage users and all grocery lists.
                    </FormDescription>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="gap-3"
                      >
                        <label className="flex items-center gap-3 cursor-pointer">
                          <RadioGroupItem value="user" id="role-user" />
                          <span>User</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <RadioGroupItem value="admin" id="role-admin" />
                          <span>Admin</span>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate("/admin/users")}
                className="h-11 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="h-11 w-full sm:w-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
