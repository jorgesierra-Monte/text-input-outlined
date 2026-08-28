import InputField from './InputField'
import MaskedInputField, { DATE_CONFIG } from './MaskedInputField'
import SelectField from './SelectField'
import PhoneField from './PhoneField'
import MotionControls from './MotionControls'
import './App.css'

const INSURANCE_OPTIONS = [
  'Aetna',
  'Blue Cross Blue Shield',
  'Cigna',
  'Humana',
  'United Healthcare',
  'Kaiser Permanente',
  'Anthem',
  'Centene',
  'Molina Healthcare',
  'WellCare',
  'Oscar Health',
  'Ambetter',
  'Highmark',
  'Elevance Health',
  'Health Net',
  'Other',
]
const SEX_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']

export default function App() {
  return (
    <div className="page">
      <h1 className="heading">Client information</h1>
      <div className="form">
        <SelectField label="Insurance"               placeholder="Select yours" options={INSURANCE_OPTIONS} />
        <PhoneField label="Phone number" />
        <InputField label="First name"               placeholder="John" />
        <MaskedInputField label="Birth date"         config={DATE_CONFIG} />
        <InputField label="Last name"                placeholder="Smith" />
        <SelectField label="Sex listed on insurance" placeholder="Select yours" options={SEX_OPTIONS} />
        <InputField label="Email"                    placeholder="email@email.com" />
      </div>
      <MotionControls />
    </div>
  )
}
