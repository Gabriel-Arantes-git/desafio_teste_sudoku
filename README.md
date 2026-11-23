# desafio_teste_sudoku

Casos de teste em JavaScript (Jest) para **Sudoku binário de tamanho 6 x 6**.

## Especificação do desafio

> Sudoku binário (by Zulli)
> - casos de teste para testar Sudoku binário de tamanho 6 x 6;
> - casos de teste em Javascript para testar Javascript.

## Colaboradores

| Nome | RA |
|---|---|
| Gabriel Arantes | 24169751-2 |
| Filipe Ruiz Boligon | 24042069-2 |

## Como executar

Requer Node.js 18 ou superior.

```bash
npm install
npm test
```

## Para fazer TDD

Os testes em [`sudoku_binario.test.js`](sudoku_binario.test.js) são a especificação. O arquivo [`sudoku_binario.js`](sudoku_binario.js) é só uma implementação de referência: pode ser apagado e reescrito a partir dos testes. Ele deve exportar `{ SudokuBinario, verificar, resolver, REGRA, TAMANHO }`.

Toda recusa carrega `erro.codigo`: `FORMATO`, `VALOR`, `POSICAO`, `FIXA`, `FIM`, `SEM_SOLUCAO` e, para regra quebrada, `TRES_SEGUIDOS`, `EXCESSO` ou `REPETIDA`.

## Regras do jogo (todas cobertas pelos testes)

- **R1**: a grade é 6 x 6 e cada célula é `0`, `1` ou vazia (`null`).
- **R2**: nunca três números iguais seguidos, na linha ou na coluna (inclusive preenchendo o buraco entre dois iguais).
- **R3**: no máximo três `0` e três `1` por linha e por coluna. Grade completa tem exatamente três de cada.
- **R4**: não há duas linhas completas iguais nem duas colunas completas iguais. Linhas incompletas podem ter o mesmo começo.

Regras da partida:

- O enunciado tem células fixas que não podem ser alteradas nem apagadas. Enunciado que já quebra regra é recusado.
- Jogada que quebra regra é recusada, a grade não muda e a jogada não conta. O jogador pode trocar e apagar as próprias jogadas.
- A dica mostra o valor certo da primeira célula vazia sem preenchê-la. Se as jogadas levaram a um beco sem saída, avisa (`SEM_SOLUCAO`).
- O jogo fica `resolvido` quando a grade é preenchida sem quebrar regra. Depois disso, jogar, apagar e pedir dica são recusados.

Coordenadas `(linha, coluna)` a partir de 0.

## Funcionamento dos casos de teste

O enunciado de teste tem 9 pistas e **solução única** (conferida por teste), o que permite prever cada dica e a grade final.

| Grupo | O que verifica |
|---|---|
| Material de referência | A solução é válida e o enunciado é compatível com ela |
| R1 | Formato, valores inválidos, enunciado copiado e não alterado |
| R2 | Trio na linha, na coluna, buraco, fim da linha, dois iguais permitidos, `verificar` aponta eixo e índice |
| R3 | Quarto 0 na linha, quarto 1 na coluna, terceiro aceito |
| R4 | Linha e coluna repetidas, começos iguais permitidos |
| Enunciado inválido | Trio, excesso e linhas repetidas já no enunciado |
| Jogadas | Células fixas, valores e posições inválidas, trocar e apagar, contagem, jogada recusada não altera nada |
| Resolução e dica | Solução única, grade vazia com várias soluções, sem saída, dica e beco sem saída |
| Fim da partida | Vitória, última célula, enunciado já completo, nada é aceito depois |
| Mapa em texto e partidas simuladas | Visualização, partida só com dicas, partida com erro e correção |
