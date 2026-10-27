import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InfoNote } from '@/components/ui/info-note';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/register';
import { useState } from 'react';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {

    const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);

    return (
        <>
            <Head title="Créer un compte" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="name">Prénom et nom</Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoComplete="name"
                                className="h-[46px] rounded-[11px] text-[15px]"
                                name="name"
                                placeholder="Faniry Rakoto"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="email">Adresse e-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                className="h-[46px] rounded-[11px] text-[15px]"
                                name="email"
                                placeholder="email@exemple.mg"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="password">Mot de passe</Label>
                            <PasswordInput
                                id="password"
                                required
                                autoComplete="new-password"
                                className="h-[46px] rounded-[11px] text-[15px]"
                                name="password"
                                passwordrules={passwordRules}
                            />
                            <span className="text-xs text-muted">
                                8 caractères minimum, dont un chiffre.
                            </span>
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="password_confirmation">
                                Confirmer le mot de passe
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                required
                                autoComplete="new-password"
                                className="h-[46px] rounded-[11px] text-[15px]"
                                name="password_confirmation"
                                passwordrules={passwordRules}
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <label className="flex items-center gap-2.5 text-[13.5px] text-text2">
                            <Checkbox 
                                id="terms" 
                                name="terms" 
                                required 
                                checked={hasAcceptedTerms}
                                onCheckedChange={(checked) => setHasAcceptedTerms(!!checked)}
                            />
                            J'accepte les conditions d'utilisation
                        </label>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full gap-2"
                            data-test="register-user-button"
                            disabled={!hasAcceptedTerms}
                        >
                            {processing && <Spinner />}
                            Créer mon compte
                        </Button>

                        <InfoNote>
                            Vos données restent à vous : export complet en CSV
                            ou Excel, à tout moment.
                        </InfoNote>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Créer mon carnet',
    description:
        'Une minute pour le compte, puis on crée ensemble votre premier projet.',
};
