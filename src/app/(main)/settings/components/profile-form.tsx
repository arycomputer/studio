
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';

const profileFormSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Por favor, insira um e-mail válido.'),
  phone: z.string().optional(),
  photo: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const defaultValues: Partial<ProfileFormValues> = {
  name: 'Usuário Exemplo',
  email: 'usuario@exemplo.com',
  phone: '',
};

export function ProfileForm() {
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });
  
  const photo = form.watch('photo');

  useEffect(() => {
    const storedPhoto = localStorage.getItem('user-photo');
    if(storedPhoto) {
      setPhotoPreview(storedPhoto);
    }
  }, []);
  
  useEffect(() => {
    if (photo && photo.length > 0) {
      const file = photo[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [photo]);

  function onSubmit(data: ProfileFormValues) {
    if (photoPreview) {
      localStorage.setItem('user-photo', photoPreview);
    }
    localStorage.setItem('user-name', data.name);
    localStorage.setItem('user-email', data.email);

    toast({
      title: 'Perfil atualizado!',
      description: 'Suas informações foram salvas com sucesso. Atualize a página para ver as mudanças no menu.',
    });
    console.log(data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>
          Atualize as informações do seu perfil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto de Perfil</FormLabel>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={photoPreview || undefined} alt="Foto do perfil" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => field.onChange(e.target.files)}
                      />
                    </FormControl>
                  </div>
                  <FormDescription>
                    Esta é a sua foto de perfil.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} />
                  </FormControl>
                  <FormDescription>
                    Este é o nome que será exibido publicamente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu e-mail" {...field} />
                  </FormControl>
                  <FormDescription>
                    Você pode gerenciar seus endereços de e-mail verificados.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular</FormLabel>
                  <FormControl>
                    <Input placeholder="(99) 99999-9999" {...field} />
                  </FormControl>
                  <FormDescription>
                    Seu número de celular para contato.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Atualizar Perfil</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
