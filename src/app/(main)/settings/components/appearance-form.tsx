
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark'], {
    required_error: 'Por favor, selecione um tema.',
  }),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

const themes = [
  { name: 'zinc', label: 'Zinco', color: 'hsl(240 5.9% 10%)' },
  { name: 'slate', label: 'Ardósia', color: 'hsl(215.4 16.3% 46.9%)' },
  { name: 'stone', label: 'Pedra', color: 'hsl(25 5.3% 44.7%)' },
  { name: 'gray', label: 'Cinza', color: 'hsl(220 8.9% 46.1%)' },
  { name: 'neutral', label: 'Neutro', color: 'hsl(0 0% 45.1%)' },
];

export function AppearanceForm() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [activeTheme, setActiveTheme] = useState('zinc');

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: 'light',
    },
  });

  useEffect(() => {
    setMounted(true);
    const storedThemeMode = localStorage.getItem('theme_mode') as 'light' | 'dark' | null;
    if (storedThemeMode) {
      form.setValue('theme', storedThemeMode);
      document.documentElement.classList.toggle('dark', storedThemeMode === 'dark');
    }
    
    const storedThemeName = localStorage.getItem('theme_name');
    if (storedThemeName) {
      setActiveTheme(storedThemeName);
      document.body.classList.forEach(className => {
        if (className.startsWith('theme-')) {
          document.body.classList.remove(className);
        }
      });
      document.body.classList.add(`theme-${storedThemeName}`);
    }
  }, [form]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme_name', activeTheme);
      document.body.classList.forEach(className => {
        if (className.startsWith('theme-')) {
          document.body.classList.remove(className);
        }
      });
      document.body.classList.add(`theme-${activeTheme}`);
    }
  }, [activeTheme, mounted]);
  
  function onSubmit(data: AppearanceFormValues) {
    localStorage.setItem('theme_mode', data.theme);
    document.documentElement.classList.toggle('dark', data.theme === 'dark');
    
    toast({
      title: 'Preferências atualizadas!',
      description: 'A aparência do aplicativo foi salva.',
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>
          Personalize a aparência do aplicativo. Alterne entre o modo claro e escuro e escolha um tema de cores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Tema</FormLabel>
                  <FormDescription>
                    Selecione o tema para o painel.
                  </FormDescription>
                  <FormMessage />
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                    className="grid max-w-md grid-cols-2 gap-8 pt-2"
                  >
                    <FormItem>
                      <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="light" className="sr-only" />
                        </FormControl>
                        <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                          <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                            <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                              <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                              <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                              <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                              <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                          </div>
                        </div>
                        <span className="block w-full p-2 text-center font-normal">
                          Claro
                        </span>
                      </FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="dark" className="sr-only" />
                        </FormControl>
                        <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
                          <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                            <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                              <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                              <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-slate-400" />
                              <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-slate-400" />
                              <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div>
                          </div>
                        </div>
                        <span className="block w-full p-2 text-center font-normal">
                          Escuro
                        </span>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormItem>
              )}
            />

            <div className="space-y-1">
                <FormLabel>Cor</FormLabel>
                <FormDescription>
                    Selecione a cor de destaque para o painel.
                </FormDescription>
                <div className="flex flex-wrap gap-3 pt-2">
                    {themes.map((theme) => (
                    <Button
                        key={theme.name}
                        type="button"
                        variant="outline"
                        className={cn(
                        'justify-start',
                        activeTheme === theme.name && 'border-2 border-primary'
                        )}
                        onClick={() => setActiveTheme(theme.name)}
                    >
                        <div
                        className="mr-2 h-5 w-5 rounded-full"
                        style={{ backgroundColor: theme.color }}
                        />
                        {theme.label}
                        {activeTheme === theme.name && <Check className="ml-auto h-4 w-4" />}
                    </Button>
                    ))}
                </div>
            </div>

            <Button type="submit">Salvar Preferências</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
