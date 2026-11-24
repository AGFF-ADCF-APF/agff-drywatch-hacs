<?php

namespace Grav\Plugin;

use Grav\Common\Plugin;
use RocketTheme\Toolbox\Event\Event;

/**
 * AGFF DryWatch: Baustein [drywatch] fuer Seiten. Ersetzt ihn durch die Web Component <agff-drywatch>
 * (assets/agff-drywatch.js, gebaut aus src/ im Repo agff-drywatch-hacs) und laedt das Skript nur dort.
 *
 * Beispiele: [drywatch]  [drywatch hoehe=800 flaeche=120 luftmenge=13 wissen=nein]
 */
class AgffDrywatchPlugin extends Plugin
{
    private const ATTRIBUTE = ['hoehe', 'flaeche', 'luftmenge'];

    public static function getSubscribedEvents(): array
    {
        return ['onPluginsInitialized' => ['onPluginsInitialized', 0]];
    }

    public function onPluginsInitialized(): void
    {
        if ($this->isAdmin()) {
            return;
        }
        $this->enable(['onPageContentProcessed' => ['onPageContentProcessed', -10]]);
    }

    public function onPageContentProcessed(Event $event): void
    {
        $page = $event['page'];
        if (!$page) {
            return;
        }
        $html = (string) $page->getRawContent();
        if (!str_contains($html, '[drywatch')) {
            return;
        }
        $erstes = true;
        $html = preg_replace_callback('/(?:<p>\s*)?\[drywatch([^\]]*)\](?:\s*<\/p>)?/u', function (array $m) use (&$erstes): string {
            $teil = $this->element($this->attribute(html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8')), $erstes);
            $erstes = false;
            return $teil;
        }, $html);
        $page->setRawContent($html);
    }

    /** @return array<string,string> */
    private function attribute(string $text): array
    {
        $a = [];
        preg_match_all('/(\w+)\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|(\S+))/u', $text, $m, PREG_SET_ORDER);
        foreach ($m as $t) {
            $a[strtolower($t[1])] = $t[2] !== '' ? $t[2] : ($t[3] ?? '') . ($t[4] ?? '');
        }
        return $a;
    }

    private function element(array $a, bool $mitSkript): string
    {
        $cfg = $this->config->get('plugins.agff-drywatch');
        $sprache = (string) ($this->grav['language']->getActive() ?: 'de');
        $attr = ['sprache' => $sprache];
        if (!empty($cfg['datei_basis'])) {
            $attr['datei-basis'] = (string) $cfg['datei_basis'];
        }
        if (!empty($cfg['speichern'])) {
            $attr['speicher'] = 'agff-drywatch';
        }
        foreach (self::ATTRIBUTE as $k) {
            if (isset($a[$k]) && is_numeric($a[$k])) {
                $attr[$k] = (string) (float) $a[$k];
            }
        }
        $html = '<agff-drywatch';
        foreach ($attr as $k => $v) {
            $html .= ' ' . $k . '="' . htmlspecialchars($v, ENT_QUOTES) . '"';
        }
        if (isset($a['wissen']) && in_array(strtolower($a['wissen']), ['nein', 'no', 'non', '0', 'false'], true)) {
            $html .= ' ohne-wissen';
        }
        $html .= '></agff-drywatch>';

        if ($mitSkript) {
            $pfad = $this->grav['locator']->findResource('plugin://agff-drywatch/assets/agff-drywatch.js', false);
            $url = rtrim((string) $this->grav['base_url'], '/') . '/' . ltrim((string) $pfad, '/');
            $html .= '<script type="module" src="' . htmlspecialchars($url, ENT_QUOTES) . '"></script>';
        }
        return $html;
    }
}
