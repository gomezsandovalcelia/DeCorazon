import { Component, OnInit } from '@angular/core';

interface FaqSection {
  title: string;
  isOpen: boolean;
  items: FaqItem[];
}

interface FaqItem {
  question: string;
  answer: string;
  videoUrl?: string;
}

@Component({
  selector: 'app-preguntas-frecuentes',
  templateUrl: './preguntas-frecuentes.component.html',
  styleUrls: ['./preguntas-frecuentes.component.scss'],
})
export class PreguntasFrecuentesComponent  {
  
  faqSections: FaqSection[] = [
    {
      title: 'Videos de ejercicios',
      isOpen: false,
      items: [
        {
          question: '¿Qué ejercicios puedo hacer después de un evento cardíaco?',
          answer: 'Estos ejercicios de bajo impacto son recomendados para la primera fase de recuperación...',
          videoUrl: 'assets/videos/ejercicios-basicos.mp4'
        },
        {
          question: '¿Cómo realizar ejercicios de respiración?',
          answer: 'Los ejercicios de respiración profunda ayudan a reducir el estrés y mejorar la oxigenación...',
          videoUrl: 'assets/videos/respiracion.mp4'
        },
        {
          question: '¿Cuáles son buenos ejercicios de calentamiento?',
          answer: 'Antes de cualquier actividad física, es importante calentar adecuadamente...',
          videoUrl: 'assets/videos/calentamiento.mp4'
        }
      ]
    },
    {
      title: 'Cómo conocer tus síntomas',
      isOpen: false,
      items: [
        {
          question: '¿Cuáles son los signos de alerta que debo vigilar?',
          answer: 'Presta atención a síntomas como dolor en el pecho, dificultad para respirar, mareos repentinos...'
        },
        {
          question: '¿Cómo distinguir entre ansiedad y un problema cardíaco?',
          answer: 'Aunque algunos síntomas pueden ser similares, existen diferencias clave...'
        },
        {
          question: '¿Cuándo debo buscar atención médica inmediata?',
          answer: 'Busca atención médica inmediata si experimentas dolor intenso en el pecho, dificultad severa para respirar...'
        }
      ]
    },
    {
      title: 'Aprende sobre los medicamentos',
      isOpen: false,
      items: [
        {
          question: '¿Qué son los betabloqueantes?',
          answer: 'Los betabloqueantes son medicamentos que reducen la presión arterial y la frecuencia cardíaca...'
        },
        {
          question: '¿Por qué es importante tomar la medicación a la misma hora?',
          answer: 'Mantener un horario regular ayuda a mantener niveles constantes del medicamento en tu sistema...'
        },
        {
          question: '¿Qué debo hacer si olvido tomar una dosis?',
          answer: 'Si olvidas tomar una dosis, consulta las indicaciones específicas para tu medicamento...'
        }
      ]
    }
  ];

  toggleSection(section: FaqSection) {
    section.isOpen = !section.isOpen;
  }

  toggleItem(item: FaqItem, section: FaqSection) {
    // Si deseas que solo un ítem esté abierto a la vez dentro de una sección
    // puedes implementar lógica adicional aquí
  }

}
