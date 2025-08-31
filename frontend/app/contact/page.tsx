import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Контакты - Технологичная одежда для каждого дня',
  description: 'Свяжитесь с нами. Наш офис в Москве, контактная информация и карта проезда.',
  openGraph: {
    title: 'Контакты - Технологичная одежда',
    description: 'Свяжитесь с нами. Офис в Москве, контактная информация',
    type: 'website'
  }
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Контакты
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Мы всегда готовы ответить на ваши вопросы
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact Information */}
        <div className="space-y-8">
          {/* Office Information */}
          <section className="rounded-lg bg-gray-50 p-8 dark:bg-gray-800">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
              Наш офис
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  Адрес
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  г. Москва, ул. Тверская, д. 15, офис 301<br />
                  115035, Россия
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  Телефон
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  <a href="tel:+74951234567" className="hover:text-blue-600 dark:hover:text-blue-400">
                    +7 (495) 123-45-67
                  </a>
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  Email
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  <a href="mailto:info@techclothing.ru" className="hover:text-blue-600 dark:hover:text-blue-400">
                    info@techclothing.ru
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Working Hours */}
          <section className="rounded-lg border border-gray-200 p-8 dark:border-gray-700">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
              Часы работы
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Понедельник - Пятница:</span>
                <span className="font-medium text-gray-900 dark:text-white">9:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Суббота:</span>
                <span className="font-medium text-gray-900 dark:text-white">10:00 - 16:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Воскресенье:</span>
                <span className="font-medium text-gray-900 dark:text-white">Выходной</span>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="rounded-lg bg-blue-50 p-8 dark:bg-blue-900/20">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
              Напишите нам
            </h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Имя
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                  placeholder="Ваше имя"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Сообщение
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                  placeholder="Ваше сообщение..."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Отправить сообщение
              </button>
            </form>
          </section>
        </div>

        {/* Map Section */}
        <div className="space-y-8">
          <section>
            <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
              Как нас найти
            </h2>

            {/* Interactive Map */}
            <div className="overflow-hidden rounded-lg shadow-lg">
              <iframe
                title="Карта расположения офиса в Москве"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2244.4958442463647!2d37.60554431592874!3d55.75583998055441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54a50b315e573%3A0xa886bf5a3d9b2e68!2sTverskaya%20St%2C%2015%2C%20Moskva%2C%20Russia%2C%20125009!5e0!3m2!1sen!2s!4v1635000000000!5m2!1sen!2s"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
          </section>

          {/* Transportation Info */}
          <section className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
            <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
              Как добраться
            </h3>
            <div className="space-y-3">
              <div>
                <strong className="text-gray-900 dark:text-white">🚇 Метро:</strong>
                <p className="text-gray-700 dark:text-gray-300">
                  Станция "Тверская" (Сокольническая линия) - 2 минуты пешком<br />
                  Станция "Пушкинская" (Таганско-Краснопресненская линия) - 5 минут пешком
                </p>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-white">🚗 На автомобиле:</strong>
                <p className="text-gray-700 dark:text-gray-300">
                  Парковка рядом с ТЦ "Галерея Актёр"<br />
                  Платная парковка в пределах Садового кольца
                </p>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-white">🚌 Общественный транспорт:</strong>
                <p className="text-gray-700 dark:text-gray-300">
                  Автобусы: 15, 144, н1<br />
                  Остановка "Тверская площадь"
                </p>
              </div>
            </div>
          </section>

          {/* Additional Info */}
          <section className="rounded-lg bg-green-50 p-6 dark:bg-green-900/20">
            <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
              📍 Ориентиры
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Рядом с площадью Пушкина</li>
              <li>• Напротив ТЦ "Галерея Актёр"</li>
              <li>• В здании с кафе "Шоколадница" на первом этаже</li>
              <li>• Вход через главный вход, лифт до 3 этажа</li>
            </ul>
          </section>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="mt-12">
        <section className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Остались вопросы?
          </h2>
          <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
            Мы всегда готовы помочь вам выбрать идеальную технологичную одежду.<br />
            Свяжитесь с нами любым удобным способом или приезжайте в наш офис в центре Москвы.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href="tel:+74951234567"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              📞 Позвонить
            </a>
            <a
              href="mailto:info@techclothing.ru"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              ✉️ Написать
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
