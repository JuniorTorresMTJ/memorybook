import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FormTextAreaProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    rows?: number;
    helperText?: string;
    icon?: React.ReactNode;
}

export const FormTextArea = ({
    id,
    label,
    value,
    onChange,
    placeholder,
    required = false,
    rows = 3,
    helperText,
    icon,
}: FormTextAreaProps) => {
    const { t } = useLanguage();

    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-2">
            <label
                htmlFor={id}
                className="block text-sm font-medium text-text-main"
            >
                {label}
                {required ? (
                    <span className="text-red-500 ml-1">*</span>
                ) : (
                    <span className="text-text-muted font-normal ml-1">({t.common?.optional || 'optional'})</span>
                )}
            </label>
            <div className="relative">
                {icon && (
                    <div
                        className={`absolute left-4 top-4 transition-colors ${
                            isFocused ? 'text-primary-teal' : 'text-text-muted'
                        }`}
                    >
                        {icon}
                    </div>
                )}
                <textarea
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    rows={rows}
                    className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 rounded-xl border-2 transition-all bg-transparent resize-none ${
                        isFocused ? 'border-primary-teal' : 'border-gray-200 dark:border-gray-700'
                    } focus:outline-none text-text-main placeholder:text-text-muted/60`}
                />
            </div>
            {helperText && (
                <p className="text-xs text-text-muted">{helperText}</p>
            )}
        </div>
    );
};

interface FormInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    icon?: React.ReactNode;
    type?: 'text' | 'email' | 'tel';
}

export const FormInput = ({
    id,
    label,
    value,
    onChange,
    placeholder,
    required = false,
    icon,
    type = 'text',
}: FormInputProps) => {
    const { t } = useLanguage();

    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-2">
            <label
                htmlFor={id}
                className="block text-sm font-medium text-text-main"
            >
                {label}
                {required ? (
                    <span className="text-red-500 ml-1">*</span>
                ) : (
                    <span className="text-text-muted font-normal ml-1">({t.common?.optional || 'optional'})</span>
                )}
            </label>
            <div className="relative">
                {icon && (
                    <div
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                            isFocused ? 'text-primary-teal' : 'text-text-muted'
                        }`}
                    >
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 rounded-xl border-2 transition-all bg-transparent ${
                        isFocused ? 'border-primary-teal' : 'border-gray-200 dark:border-gray-700'
                    } focus:outline-none text-text-main placeholder:text-text-muted/60`}
                />
            </div>
        </div>
    );
};
