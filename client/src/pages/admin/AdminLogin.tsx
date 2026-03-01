import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface LoginForm {
  password: string;
}

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginForm>({ defaultValues: { password: "" } });

  async function onSubmit(values: LoginForm) {
    setLoading(true);
    try {
      await apiRequest("POST", "/api/admin/login", { password: values.password });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/session"] });
      setLocation("/admin/places");
    } catch {
      toast({ title: "Incorrect password", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-1 text-sm">Houndsabout listing management</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                rules={{ required: "Password is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-admin-password"
                        type="password"
                        placeholder="Enter admin password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                data-testid="button-admin-login"
                type="submit"
                className="w-full"
                disabled={loading}
                style={{ backgroundColor: "#ff9900", color: "white" }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
