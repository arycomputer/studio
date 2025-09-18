
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addClient } from '@/app/actions';
import { useState } from 'react';
import { Loader2, Trash2, X, File as FileIcon } from 'lucide-react';
import type { Client } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Por favor, insira um e-mail válido.'),
  phone: z.string().optional(),
  address: z.string().optional(),
  rate: z.coerce
    .number({ invalid_type_error: 'A taxa deve ser um número.' })
    .positive('A taxa de juros deve ser um número positivo.')
    .optional(),
  documents: z.any().optional(),
});

type AddClientFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClientAdded: (client: Client) => void;
};

const isImageFile = (file: File) => file.type.startsWith('image/');

export function AddClientForm({
  isOpen,
  onOpenChange,
  onClientAdded,
}: AddClientFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      rate: 0,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(event.target.files!)]);
    }
     // Reset the input value to allow selecting the same file again
    if(event.target){
      event.target.value = '';
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const newClient = await addClient({...values, documents: files});
      onClientAdded(newClient);
      toast({
        title: 'Sucesso!',
        description: 'Novo cliente adicionado.',
      });
      form.reset();
      setFiles([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível adicionar o cliente. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            form.reset();
            setFiles([]);
        }
        onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para adicionar um novo cliente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
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
                    <Input placeholder="john.doe@example.com" {...field} />
                  </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="123 Main St, Anytown, USA"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taxa Mensal de Juros (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1.0" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="documents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documentos</FormLabel>
                   <FormControl>
                     <Button type="button" variant="outline" asChild>
                        <label htmlFor="file-upload" className="cursor-pointer w-full">
                           Adicionar Arquivos...
                           <Input 
                              id="file-upload"
                              type="file" 
                              multiple
                              onChange={handleFileChange}
                              className="sr-only"
                           />
                        </label>
                     </Button>
                  </FormControl>
                  <FormMessage />
                  
                   {files && files.length > 0 && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {files.map((file, index) => (
                            isImageFile(file) ? (
                              <Card key={index} className="relative group">
                                <CardContent className="p-0">
                                  <Image
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    width={100}
                                    height={100}
                                    className="w-full h-24 object-cover rounded-md"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </CardContent>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </Card>
                            ) : null
                          ))}
                        </div>
                        <ul className='text-sm text-muted-foreground space-y-1 pt-2'>
                          {files.map((file, index) => (
                            !isImageFile(file) ? (
                              <li key={index} className='flex items-center justify-between bg-muted p-1 rounded-md'>
                                  <div className="flex items-center gap-2 truncate">
                                    <FileIcon className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{file.name}</span>
                                  </div>
                                  <Button type="button" variant="ghost" size="icon" className='h-6 w-6 flex-shrink-0' onClick={() => removeFile(index)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                              </li>
                            ) : null
                          ))}
                        </ul>
                      </div>
                    )}
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Adicionar Cliente
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
