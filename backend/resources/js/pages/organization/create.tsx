import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InfoNote } from '@/components/ui/info-note';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/organization';

// Shown first so most users never scroll the full IANA list.
const COMMON_TIMEZONES = [
    'Indian/Antananarivo',
    'Indian/Comoro',
    'Indian/Mayotte',
    'Indian/Reunion',
    'Indian/Mauritius',
    'Europe/Paris',
];

// Comes from the runtime (browser, or Node during SSR), so no network call.
// Some ids are IANA backward-compat aliases (e.g. Asia/Calcutta), so the
// backend must validate with `timezone:all_with_bc`, not plain `timezone`.
const OTHER_TIMEZONES = Intl.supportedValuesOf('timeZone').filter(
    (tz) => !COMMON_TIMEZONES.includes(tz),
);

type CurrencyOption = {
    value: string;
    label: string;
};

type Props = {
    // From App\Domain\Organization\Enums\Currency::options().
    currencies: CurrencyOption[];
};

function timezoneLabel(timezone: string): string {
    return timezone.replaceAll('_', ' ');
}

export default function CreateOrganization({ currencies }: Props) {
    return (
        <>
            <Head title="Créer mon organisation" />
            <Card>
                <CardContent>
                    <Form
                        {...store.form()}
                        disableWhileProcessing
                        className="flex flex-col gap-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="name">
                                        Nom de l'organisation
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        autoComplete="organization"
                                        className="h-[46px] rounded-[11px] text-[15px]"
                                        name="name"
                                        placeholder="Famille Rakoto"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="timezone">
                                        Fuseau horaire
                                    </Label>
                                    <Select
                                        name="timezone"
                                        defaultValue="Indian/Antananarivo"
                                        required
                                    >
                                        <SelectTrigger
                                            id="timezone"
                                            className="h-[46px] w-full rounded-[11px] text-[15px]"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-80">
                                            <SelectGroup>
                                                <SelectLabel>
                                                    Courants
                                                </SelectLabel>
                                                {COMMON_TIMEZONES.map((tz) => (
                                                    <SelectItem
                                                        key={tz}
                                                        value={tz}
                                                    >
                                                        {timezoneLabel(tz)}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                            <SelectSeparator />
                                            <SelectGroup>
                                                <SelectLabel>Tous</SelectLabel>
                                                {OTHER_TIMEZONES.map((tz) => (
                                                    <SelectItem
                                                        key={tz}
                                                        value={tz}
                                                    >
                                                        {timezoneLabel(tz)}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.timezone} />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="currency">Devise</Label>
                                    <Select
                                        name="currency"
                                        defaultValue="MGA"
                                        required
                                    >
                                        <SelectTrigger
                                            id="currency"
                                            className="h-[46px] w-full rounded-[11px] text-[15px]"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.map((currency) => (
                                                <SelectItem
                                                    key={currency.value}
                                                    value={currency.value}
                                                >
                                                    {currency.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.currency} />
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full gap-2"
                                    data-test="create-organization-button"
                                >
                                    {processing && <Spinner />}
                                    Créer mon organisation
                                </Button>

                                <InfoNote>
                                    Vos données restent à vous : export complet
                                    en CSV ou Excel, à tout moment.
                                </InfoNote>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>
        </>
    );
}

CreateOrganization.layout = {
    title: 'Créer mon organisation',
    description:
        'Une dernière étape : nommez votre organisation, puis on crée ensemble votre premier projet.',
};
