
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
import { updateClient, deleteClientDocument } from '@/app/actions';
import { useState, useEffect } from 'react';
import { Loader2, Trash2, Download } from 'lucide-react';
import type { Client, ClientDocument } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Por favor, insira um e-mail válido.'),
  phone: z.string().optional(),
  address: z.string().optional(),
  rate: z.coerce.number().optional(),
  newDocuments: z.any().optional(),
});

type EditClientFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  client: Client;
  onClientUpdated: (client: Client) => void;
};

export function EditClientForm({
  isOpen,
  onOpenChange,
  client,
  onClientUpdated,
}: EditClientFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client>(client);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      address: client.address || '',
      rate: client.rate || 0,
    },
  });

  useEffect(() => {
    setCurrentClient(client);
    form.reset({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      address: client.address || '',
      rate: client.rate || 0,
    });
    setNewFiles([]);
  }, [client, isOpen, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setNewFiles(Array.from(event.target.files));
    }
  };

  const removeNewFile = (indexToRemove: number) => {
    setNewFiles(newFiles.filter((_, index) => index !== indexToRemove));
  };
  
  const handleDocumentDelete = async (documentUrl: string) => {
    try {
      await deleteClientDocument(currentClient.id, documentUrl);
      const updatedClient = {
        ...currentClient,
        documents: currentClient.documents?.filter(doc => doc.url !== documentUrl)
      };
      setCurrentClient(updatedClient);
      onClientUpdated(updatedClient);
      toast({
        title: 'Sucesso!',
        description: 'Documento excluído.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir o documento.',
      });
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const updatedData = { ...values, newDocuments: newFiles };
      const updated = await updateClient(client.id, updatedData);
      onClientUpdated(updated);
      toast({
        title: 'Sucesso!',
        description: 'Cliente atualizado.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar o cliente. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize os detalhes do cliente abaixo.
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
                    <Input type="number" placeholder="1.0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className='space-y-2'>
              <FormLabel>Documentos Existentes</FormLabel>
              {currentClient.documents && currentClient.documents.length > 0 ? (
                <div className="space-y-2 rounded-md border p-2">
                  {currentClient.documents.map(doc => (
                    <div key={doc.url} className="flex items-center justify-between text-sm">
                      <span className='truncate pr-2'>{doc.name}</span>
                      <div className='flex items-center gap-2 flex-shrink-0'>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                            <Button type='button' variant="outline" size="icon" className="h-7 w-7">
                                <Download className="h-4 w-4" />
                            </Button>
                        </a>
                        <Button type='button' variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDocumentDelete(doc.url)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>Nenhum documento existente.</p>
              )}
            </div>

            <FormField
              control={form.control}
              name="newDocuments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adicionar Novos Documentos</FormLabel>
                  <FormControl>
                     <Input 
                      type="file" 
                      multiple
                      onChange={handleFileChange}
                    />
                  </FormControl>
                  <FormMessage />
                  {newFiles && newFiles.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <p className="font-medium">Novos arquivos selecionados:</p>
                        <ul className='space-y-1'>
                        {newFiles.map((file, index) => (
                            <li key={index} className='flex items-center justify-between'>
                                <span>- {file.name}</span>
                                <Button type="button" variant="ghost" size="icon" className='h-6 w-6' onClick={() => removeNewFile(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </li>
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
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    