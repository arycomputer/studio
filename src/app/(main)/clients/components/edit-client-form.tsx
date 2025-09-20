
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
import { updateClient, deleteClientDocument, getAddressFromCEP } from '@/actions';
import { useState, useEffect } from 'react';
import { Loader2, Trash2, Download, X, File as FileIcon, UserX } from 'lucide-react';
import type { Client } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Por favor, insira um e-mail válido.'),
  phone: z.string().optional().refine(
    (value) => {
      if (!value) return true; // Optional field
      const numericValue = value.replace(/\D/g, '');
      return numericValue.length === 10 || numericValue.length === 11;
    },
    {
      message: 'O número de celular deve ter 10 ou 11 dígitos (com DDD).',
    }
  ),
  address: z.object({
    cep: z.string().optional().refine(
        (value) => {
            if(!value) return true;
            return /^\d{8}$/.test(value.replace(/\D/g, ''));
        },
        'CEP inválido. Deve conter 8 dígitos.'
    ),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    referencia: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
  }).optional(),
  rate: z.coerce
    .number({ invalid_type_error: 'A taxa deve ser um número.' })
    .positive('A taxa de juros deve ser um número positivo.')
    .optional(),
  newDocuments: z.any().optional(),
  photo: z.any().optional(),
});

type EditClientFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  client: Client;
  onClientUpdated: (client: Client) => void;
};

const isImageFile = (file: File) => file.type.startsWith('image/');
const isImageUrl = (url: string) => /\.(jpeg|jpg|gif|png|webp)$/i.test(url) || url.startsWith('data:image');

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}


export function EditClientForm({
  isOpen,
  onOpenChange,
  client,
  onClientUpdated,
}: EditClientFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client>(client);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  
  const cepValue = form.watch('address.cep');
  const photoField = form.watch('photo');


  useEffect(() => {
    setCurrentClient(client);
    setPhotoPreview(client.avatarUrl || `https://ui-avatars.com/api/?name=${getInitials(client.name)}&background=E2E8F0&color=475569`);
    setIsPhotoRemoved(false);
    form.reset({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      address: client.address || {
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        referencia: '',
        cidade: '',
        estado: '',
      },
      rate: client.rate || 0,
    });
    setNewFiles([]);
  }, [client, isOpen, form]);

  useEffect(() => {
    if (photoField && photoField.length > 0) {
      const file = photoField[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setIsPhotoRemoved(false); // If a new photo is selected, it's not "removed"
      };
      reader.readAsDataURL(file);
    }
  }, [photoField]);

  useEffect(() => {
    const fetchAddress = async () => {
      const cep = cepValue?.replace(/\D/g, '');
      if (cep && cep.length === 8) {
        setIsFetchingCep(true);
        try {
            const result = await getAddressFromCEP(cep);
            if ('logradouro' in result) {
              form.setValue('address.logradouro', result.logradouro || '');
              form.setValue('address.bairro', result.bairro || '');
              form.setValue('address.cidade', result.cidade || '');
              form.setValue('address.estado', result.estado || '');
              form.setFocus('address.numero');
            } else {
                toast({
                    variant: 'destructive',
                    title: 'CEP não encontrado',
                    description: result.error,
                })
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro de Rede',
                description: 'Não foi possível buscar o endereço.',
            })
        } finally {
            setIsFetchingCep(false);
        }
      }
    };
    fetchAddress();
  }, [cepValue, form, toast]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setNewFiles(prevFiles => [...prevFiles, ...Array.from(event.target.files!)]);
    }
    if(event.target){
      event.target.value = '';
    }
  };
  
  const handleRemovePhoto = () => {
    const initials = getInitials(form.getValues('name'));
    setPhotoPreview(`https://ui-avatars.com/api/?name=${initials}&background=E2E8F0&color=475569`);
    form.setValue('photo', null);
    setIsPhotoRemoved(true);
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    let numericValue = value.replace(/\D/g, '');
    
    if (numericValue.length > 11) {
      numericValue = numericValue.substring(0, 11);
    }
    
    let formattedValue = '';
    if (numericValue.length > 0) {
      formattedValue = '(' + numericValue;
    }
    if (numericValue.length > 2) {
      formattedValue = `(${numericValue.substring(0, 2)}) ${numericValue.substring(2)}`;
    }
    if (numericValue.length > 6 && numericValue.length <= 10) {
       formattedValue = `(${numericValue.substring(0, 2)}) ${numericValue.substring(2, 6)}-${numericValue.substring(6)}`;
    }
    if (numericValue.length > 10) {
       formattedValue = `(${numericValue.substring(0, 2)}) ${numericValue.substring(2, 7)}-${numericValue.substring(7, 11)}`;
    }

    form.setValue('phone', formattedValue);
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    let formattedValue = value.replace(/\D/g, '');
    
    if (formattedValue.length > 8) {
      formattedValue = formattedValue.substring(0, 8);
    }
    
    if (formattedValue.length > 5) {
      formattedValue = formattedValue.replace(/(\d{5})(\d)/, '$1-$2');
    }

    form.setValue('address.cep', formattedValue);
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const updatedData = { 
        ...values, 
        newDocuments: newFiles, 
        photo: values.photo?.[0],
        removePhoto: isPhotoRemoved,
      };
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
      <DialogContent className="sm:max-w-lg max-h-[90svh] flex flex-col">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize os detalhes do cliente abaixo.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden px-6">
          <ScrollArea className="h-full pr-4">
            <Form {...form}>
              <form id="edit-client-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                 <FormField
                    control={form.control}
                    name="photo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Foto do Cliente</FormLabel>
                        <div className="flex items-center gap-4">
                             <Avatar className="h-20 w-20">
                                <AvatarImage src={photoPreview || `https://ui-avatars.com/api/?name=${getInitials(client.name)}&background=E2E8F0&color=475569`} alt="Foto do cliente" />
                                <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-2">
                                <FormControl>
                                <Input 
                                    type="file" 
                                    accept="image/*"
                                    className='max-w-48'
                                    onChange={(e) => {
                                      field.onChange(e.target.files)
                                      if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          setPhotoPreview(reader.result as string);
                                          setIsPhotoRemoved(false);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                />
                                </FormControl>
                                {(photoPreview && !photoPreview.includes('ui-avatars.com')) &&
                                    <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive max-w-48" onClick={handleRemovePhoto}>
                                        <UserX className="mr-2 h-4 w-4" />
                                        Remover Foto
                                    </Button>
                                }
                            </div>
                        </div>
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
                          <Input placeholder="(99) 99999-9999" {...field} onChange={handlePhoneChange} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                  
                  <div className="space-y-4 rounded-md border p-4">
                      <h3 className="text-sm font-medium">Endereço</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                          control={form.control}
                          name="address.cep"
                          render={({ field }) => (
                              <FormItem className="col-span-1">
                              <FormLabel>CEP</FormLabel>
                              <FormControl>
                                  <div className="relative">
                                  <Input placeholder="00000-000" {...field} value={field.value ?? ''} onChange={handleCepChange} />
                                  {isFetchingCep && (
                                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                      </div>
                                  )}
                                  </div>
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </div>
                      <FormField
                      control={form.control}
                      name="address.logradouro"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Logradouro</FormLabel>
                          <FormControl>
                              <Input placeholder="Rua Principal" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                          control={form.control}
                          name="address.numero"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Número</FormLabel>
                              <FormControl>
                                  <Input placeholder="123" {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                          <FormField
                          control={form.control}
                          name="address.bairro"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Bairro</FormLabel>
                              <FormControl>
                                  <Input placeholder="Centro" {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </div>
                      <FormField
                      control={form.control}
                      name="address.referencia"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Referência</FormLabel>
                          <FormControl>
                              <Input placeholder="Próximo ao parque" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                          <FormField
                              control={form.control}
                              name="address.cidade"
                              render={({ field }) => (
                              <FormItem className="sm:col-span-3">
                                  <FormLabel>Cidade</FormLabel>
                                  <FormControl>
                                  <Input placeholder="Sua cidade" {...field} value={field.value ?? ''} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="address.estado"
                              render={({ field }) => (
                              <FormItem className="sm:col-span-2">
                                  <FormLabel>Estado</FormLabel>
                                  <FormControl>
                                  <Input placeholder="UF" {...field} value={field.value ?? ''} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                      </div>
                  </div>

                  <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Taxa Padrão de Juros (%)</FormLabel>
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
                          <label htmlFor="new-file-upload" className={cn("cursor-pointer w-full", isSubmitting && "pointer-events-none opacity-50")}>
                              Adicionar Novos Arquivos...
                              <Input 
                              id="new-file-upload"
                              type="file" 
                              multiple
                              accept="image/*,application/pdf"
                              onChange={handleFileChange}
                              className="sr-only"
                              disabled={isSubmitting}
                              />
                          </label>
                      </Button>
                  </FormControl>
                  </div>
              </form>
            </Form>
          </ScrollArea>
        </div>
        <DialogFooter className="px-6 pb-6 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" form="edit-client-form" disabled={isSubmitting || isFetchingCep}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    