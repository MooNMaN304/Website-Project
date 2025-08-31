import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'О нас - Технологичная одежда для каждого дня',
  description: 'Узнайте больше о нашей компании и миссии создания инновационной одежды для спорта и повседневной жизни.',
  openGraph: {
    title: 'О нас - Технологичная одежда',
    description: 'Инновационная одежда для спорта и повседневной жизни',
    type: 'website'
  }
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          О нас
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Создаем будущее моды с помощью технологий
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Mission Section */}
        <section className="rounded-lg bg-gray-50 p-8 dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Наша миссия
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            Мы создаем технологичную одежду, которая идеально подходит как для повседневной носки,
            так и для активных занятий спортом. Наша цель — объединить комфорт, функциональность
            и стиль в каждом изделии, используя самые передовые материалы и инновационные технологии.
          </p>
        </section>

        {/* Technology Section */}
        <section>
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Технологии и инновации
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <h3 className="mb-3 text-xl font-medium text-gray-900 dark:text-white">
                Дышащие материалы
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Использование высокотехнологичных волокон, которые обеспечивают отличную
                вентиляцию и отвод влаги, сохраняя комфорт в течение всего дня.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <h3 className="mb-3 text-xl font-medium text-gray-900 dark:text-white">
                Антибактериальная обработка
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Специальные пропитки предотвращают размножение бактерий и появление
                неприятных запахов даже при интенсивных тренировках.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <h3 className="mb-3 text-xl font-medium text-gray-900 dark:text-white">
                Терморегуляция
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Умные ткани адаптируются к температуре тела, поддерживая оптимальный
                микроклимат в любых условиях.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <h3 className="mb-3 text-xl font-medium text-gray-900 dark:text-white">
                Прочность и эластичность
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Наша одежда сохраняет форму и цвет после множества стирок,
                обеспечивая долговечность и надежность.
              </p>
            </div>
          </div>
        </section>

        {/* Product Categories */}
        <section>
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Для спорта и повседневной жизни
          </h2>
          <div className="space-y-6">
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
              <h3 className="mb-3 text-xl font-medium text-gray-900 dark:text-white">
                Спортивная линия
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Специально разработанная одежда для тренировок, бега, фитнеса и других видов спорта.
                Максимальная свобода движений, отличная вентиляция и компрессионная поддержка
                помогут вам достичь новых высот в спорте.
              </p>
            </div>
            <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-6 dark:from-green-900/20 dark:to-emerald-900/20">
              <h3 className="mb-3 text-xl font-medium text-gray-900 dark:text-white">
                Повседневная коллекция
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Стильная и комфортная одежда для каждого дня. Современный дизайн сочетается
                с практичностью — идеально для работы, прогулок и активного отдыха.
                Технологичные ткани обеспечивают комфорт с утра до вечера.
              </p>
            </div>
          </div>
        </section>

        {/* Sustainability Section */}
        <section className="rounded-lg bg-green-50 p-8 dark:bg-green-900/20">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Забота об экологии
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            Мы ответственно относимся к окружающей среде. В производстве используются
            экологически чистые материалы и технологии. Наша упаковка изготовлена из
            переработанных материалов, а производственные процессы оптимизированы для
            минимального воздействия на природу.
          </p>
        </section>

        {/* Values Section */}
        <section>
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Наши ценности
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-3 text-3xl">🎯</div>
              <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Качество</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Каждое изделие проходит строгий контроль качества
              </p>
            </div>
            <div className="text-center">
              <div className="mb-3 text-3xl">🔬</div>
              <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Инновации</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Постоянно внедряем новые технологии и материалы
              </p>
            </div>
            <div className="text-center">
              <div className="mb-3 text-3xl">🌱</div>
              <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Экология</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Заботимся о планете для будущих поколений
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="rounded-lg bg-gray-900 p-8 text-white dark:bg-gray-100 dark:text-gray-900">
            <h2 className="mb-4 text-2xl font-semibold">
              Готовы попробовать?
            </h2>
            <p className="mb-6 text-lg">
              Откройте для себя новый уровень комфорта и стиля
            </p>
            <a
              href="/catalog"
              className="inline-block rounded-lg bg-white px-8 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-100 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
            >
              Перейти в каталог
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
