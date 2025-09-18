
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
import { Loader2, Trash2, Download, X, File as FileIcon } from 'lucide-react';
import type { Client, ClientDocument } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Por favor, insira um e-mail válido.'),
  phone: z.string().optional(),
  address: z.string().optional(),
  rate: z.coerce
    .number({ invalid_type_error: 'A taxa deve ser um número.' })
    .positive('A taxa de juros deve ser um número positivo.')
    .optional(),
  newDocuments: z.any().optional(),
});

type EditClientFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  client: Client;
  onClientUpdated: (client: Client) => void;
};

const isImageFile = (file: File) => file.type.startsWith('image/');
const isImageUrl = (url: string) => /\.(jpeg|jpg|gif|png|webp)$/i.test(url);


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
      setNewFiles(prevFiles => [...prevFiles, ...Array.from(event.target.files!)]);
    }
    if(event.target){
      event.target.value = '';
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
      <DialogContent className="sm:max-w-lg">
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
                    <Input type="number" placeholder="1.0" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className='space-y-2'>
              <FormLabel>Documentos</FormLabel>
              {currentClient.documents && currentClient.documents.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {currentClient.documents.map((doc) => (
                       isImageUrl(doc.url) ? (
                        <Card key={doc.url} className="relative group">
                          <CardContent className="p-0">
                            <Image
                              src={doc.url}
                              alt={doc.name}
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
                            onClick={() => handleDocumentDelete(doc.url)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </Card>
                       ) : null
                    ))}
                  </div>
                   <ul className='text-sm text-muted-foreground space-y-1 pt-2'>
                      {currentClient.documents.map(doc => (
                        !isImageUrl(doc.url) ? (
                           <li key={doc.url} className="flex items-center justify-between bg-muted p-1 rounded-md">
                              <div className="flex items-center gap-2 truncate">
                                <FileIcon className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{doc.name}</span>
                              </div>
                              <div className='flex items-center gap-1'>
                                 <Button type='button' variant="ghost" size="icon" className="h-6 w-6" asChild>
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                                        <Download className="h-4 w-4" />
                                    </a>
                                 </Button>
                                 <Button type='button' variant="ghost" size="icon" className='h-6 w-6' onClick={() => handleDocumentDelete(doc.url)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                              </div>
                          </li>
                        ) : null
                      ))}
                    </ul>
                </div>
              ) : (
                 newFiles.length === 0 && <p className='text-sm text-muted-foreground'>Nenhum documento adicionado.</p>
              )}

              {newFiles && newFiles.length > 0 && (
                <div className="space-y-2 pt-2">
                   <p className="text-sm font-medium">Novos Documentos</p>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {newFiles.map((file, index) => (
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
                              onClick={() => removeNewFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </Card>
                        ) : null
                      ))}
                    </div>
                     <ul className='text-sm text-muted-foreground space-y-1 pt-2'>
                        {newFiles.map((file, index) => (
                          !isImageFile(file) ? (
                             <li key={index} className='flex items-center justify-between bg-muted p-1 rounded-md'>
                                <div className="flex items-center gap-2 truncate">
                                  <FileIcon className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{file.name}</span>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className='h-6 w-6 flex-shrink-0' onClick={() => removeNewFile(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </li>
                          ): null
                        ))}
                    </ul>
                </div>
              )}
              
              <FormControl>
                  <Button type="button" variant="outline" asChild>
                    <label htmlFor="new-file-upload" className="cursor-pointer w-full">
                        Adicionar Novos Arquivos...
                        <Input 
                          id="new-file-upload"
                          type="file" 
                          multiple
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                    </label>
                  </Button>
              </FormControl>
            </div>

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
